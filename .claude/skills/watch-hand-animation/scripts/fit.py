"""Step 1: rectify the dial. Homography from the measured minute-track squares to a circle.

usage: fit.py <config.json> [dark|light|all]
writes: geom_<v>.json (H, pivot P in rect4x) and rect_<v>.png (2400x2400 rectified photo)
"""
import json
import sys

import cv2
import numpy as np

from common import RECT_SIZE, parse

cfg, args = parse(sys.argv, __doc__.split("usage: ")[1].split("\n")[0])
RAD = cfg["rect"]["square_radius"]
K = cfg["rect"]["scale"]
C0 = RECT_SIZE / 2 / K

for v in cfg.variants(args[0] if args else None):
    var = cfg["variants"][v]
    src = np.array([s["xy"] for s in var["squares"]], np.float64)
    dst = np.array([(C0 + RAD * np.sin(np.radians(s["angle"])), C0 - RAD * np.cos(np.radians(s["angle"])))
                    for s in var["squares"]], np.float64)
    H, _ = cv2.findHomography(src, dst, 0)
    res = np.hypot(*(cv2.perspectiveTransform(src[None], H)[0] - dst).T)
    P = cv2.perspectiveTransform(np.array([[var["hub"]]], np.float64), H)[0][0] * K
    print("%s: max square residual %.2f px (want < 1.5), pivot rect4x (%.1f, %.1f)" % (v, res.max(), *P))
    if res.max() > 1.5:
        print("  !! a square is mis-measured or mislabelled (angle). Residuals:", np.round(res, 2).tolist())
    with open(cfg.w("geom_%s.json" % v), "w") as f:
        json.dump({"H": H.tolist(), "C0": C0, "RAD": RAD, "K": K, "P": P.tolist()}, f)
    img = cv2.imread(cfg.source(v))
    cv2.imwrite(cfg.w("rect_%s.png" % v), cv2.warpPerspective(img, np.diag([K, K, 1]) @ H, (RECT_SIZE, RECT_SIZE),
                                                              flags=cv2.INTER_CUBIC))
