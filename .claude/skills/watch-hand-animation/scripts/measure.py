"""Measuring helpers for the semi-automatic setup (look at the output images, read coordinates off the grid).

usage: measure.py <config.json> <command> ...
  grid    <variant> src|rect x0 y0 x1 y1 [zoom]  zoomed crop with a labelled coordinate grid
  squares <variant>                              8x tiles around every configured minute-track square (refine centres)
  overlay <variant>                              draw the whole config (squares on the photo; hands, needle tip, hub,
                                                 protected boxes and radii on the rectified dial) for a visual check
Images go to tmp/hand-anim/<slug>/measure_*.png
"""
import sys

import cv2
import numpy as np

from common import C, Cfg, geom


def grid(img, x0, y0, x1, y1, zoom):
    t = cv2.resize(img[y0:y1, x0:x1], None, fx=zoom, fy=zoom, interpolation=cv2.INTER_CUBIC)
    span = max(x1 - x0, y1 - y0)
    step = next(s for s in (2, 5, 10, 20, 50, 100, 200) if span / s <= 40)
    for x in range(x0 - x0 % step + step, x1, step):
        major = x % (step * 5) == 0
        cv2.line(t, (int((x - x0) * zoom), 0), (int((x - x0) * zoom), t.shape[0]), (0, 0, 255) if major else (255, 190, 90), 1)
        if major:
            cv2.putText(t, str(x), (int((x - x0) * zoom) + 2, 12), 0, 0.4, (0, 120, 255), 1)
    for y in range(y0 - y0 % step + step, y1, step):
        major = y % (step * 5) == 0
        cv2.line(t, (0, int((y - y0) * zoom)), (t.shape[1], int((y - y0) * zoom)), (0, 0, 255) if major else (255, 190, 90), 1)
        if major:
            cv2.putText(t, str(y), (2, int((y - y0) * zoom) + 12), 0, 0.4, (0, 120, 255), 1)
    return t


cfg = Cfg(sys.argv[1]) if len(sys.argv) > 2 else sys.exit(__doc__)
cmd, rest = sys.argv[2], sys.argv[3:]

if cmd == "grid":
    v, space = rest[0], rest[1]
    x0, y0, x1, y1 = map(int, rest[2:6])
    zoom = float(rest[6]) if len(rest) > 6 else max(1.0, 900 / max(x1 - x0, y1 - y0))
    img = cv2.imread(cfg.source(v) if space == "src" else cfg.w("rect_%s.png" % v))
    out = cfg.w("measure_grid_%s_%s_%d_%d.png" % (v, space, x0, y0))
    cv2.imwrite(out, grid(img, x0, y0, x1, y1, zoom))
    print(out)

elif cmd == "squares":
    v = rest[0]
    img = cv2.imread(cfg.source(v))
    R, Z = 16, 8
    tiles = []
    for s in cfg["variants"][v]["squares"]:
        x, y = s["xy"]
        xi, yi = int(round(x)), int(round(y))
        t = cv2.resize(img[yi - R:yi + R, xi - R:xi + R], (2 * R * Z, 2 * R * Z), interpolation=cv2.INTER_NEAREST)
        for i in range(0, 2 * R + 1, 4):
            cv2.line(t, (i * Z, 0), (i * Z, 2 * R * Z), (255, 190, 90), 1)
            cv2.line(t, (0, i * Z), (2 * R * Z, i * Z), (255, 190, 90), 1)
        cx, cy = int((x - xi + R) * Z), int((y - yi + R) * Z)
        cv2.drawMarker(t, (cx, cy), (0, 0, 255), cv2.MARKER_CROSS, 18, 1)
        cv2.putText(t, "%d deg @%.1f,%.1f (grid 4px, tile origin %d,%d)" % (s["angle"], x, y, xi - R, yi - R),
                    (4, 14), 0, 0.42, (0, 0, 255), 1)
        tiles.append(t)
    while len(tiles) % 4:
        tiles.append(np.full_like(tiles[0], 255))
    out = cfg.w("measure_squares_%s.png" % v)
    cv2.imwrite(out, np.vstack([np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)]))
    print(out)

elif cmd == "overlay":
    v = rest[0]
    src = cv2.imread(cfg.source(v))
    var = cfg["variants"][v]
    for s in var["squares"]:
        cv2.drawMarker(src, tuple(int(round(c)) for c in s["xy"]), (0, 0, 255), cv2.MARKER_CROSS, 14, 1)
        cv2.putText(src, str(s["angle"]), (int(s["xy"][0]) + 6, int(s["xy"][1]) - 6), 0, 0.4, (0, 0, 255), 1)
    cv2.drawMarker(src, tuple(int(round(c)) for c in var["hub"]), (255, 0, 255), cv2.MARKER_CROSS, 14, 1)
    cv2.imwrite(cfg.w("measure_overlay_src_%s.png" % v), src)
    R = cv2.imread(cfg.w("rect_%s.png" % v))
    P = np.array(geom(cfg, v)["P"])
    hd, rd = cfg["hands"], cfg["radii"]
    poly = lambda p, col: cv2.polylines(R, [np.round(np.array(p, float)).astype(np.int32)], True, col, 2, cv2.LINE_AA)
    for p in hd["static"].values():
        poly(p, (255, 0, 0))
    poly(hd["counterweight_photo"], (0, 160, 0))
    cv2.line(R, tuple(np.int32(P)), tuple(np.int32(hd["needle_tip"])), (0, 128, 255), 2)
    cv2.circle(R, tuple(np.int32(P)), hd["hub_radius"], (255, 0, 255), 2)
    for x0, y0, x1, y1 in cfg["protect"]["text_boxes"]:
        cv2.rectangle(R, (x0, y0), (x1, y1), (0, 200, 200), 2)
    for x0, y0, x1, y1 in cfg["protect"]["keep_boxes"]:
        cv2.rectangle(R, (x0, y0), (x1, y1), (0, 0, 255), 2)
    for name, col in (("track", (200, 0, 200)), ("markers", (0, 140, 255))):
        for rad in rd[name]:
            cv2.circle(R, tuple(np.int32(C)), int(rad), col, 1, cv2.LINE_AA)
    out = cfg.w("measure_overlay_rect_%s.png" % v)
    cv2.imwrite(out, cv2.resize(R, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA))
    print(cfg.w("measure_overlay_src_%s.png" % v))
    print(out)
else:
    sys.exit(__doc__)
