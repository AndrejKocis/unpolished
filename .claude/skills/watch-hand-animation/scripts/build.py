"""Step 2: build animation layers in rect4x space.

usage: build.py <config.json> [dark|light|all]
needs: geom_<v>.json, rect_<v>.png (fit.py)
writes: layers_<v>.npz (clean dial, static hands, hub, masks), hand_<v>.npz (vector seconds hand),
        preview_clean_<v>.jpg (photo | clean dial)

Only what moves is removed from the photo (seconds needle, counterweight, their shadows). Static hands,
the hand stack and their real shadows are kept. Applied indices, minute ticks, text and the date window
are protected; the needle path is refilled from the same dial region rotated 30 deg.
"""
import sys

import cv2
import numpy as np

from common import C, RECT_SIZE, box_mask, disc, fill_multiscale, geom, lab, nconv, parse, poly_mask, rot, samp

cfg, args = parse(sys.argv, __doc__.split("usage: ")[1].split("\n")[0])
HD, RD, PR = cfg["hands"], cfg["radii"], cfg["protect"]
H = W = RECT_SIZE
k = lambda n: np.ones((n, n), np.uint8)


def needle_poly(P, tip, w_base, w_tip):
    u = (tip - P) / np.linalg.norm(tip - P)
    n = np.array([-u[1], u[0]])
    base = P + u * 30
    return [tuple(base + n * w_base), tuple(tip + n * w_tip), tuple(tip + u * 3), tuple(tip - n * w_tip),
            tuple(base - n * w_base)]


def needle_zone_poly(P, tip, sh):
    """needle + its soft photo shadow (measured profile; shadow side = +n pointing down on screen)"""
    u = (tip - P) / np.linalg.norm(tip - P)
    n = np.array([-u[1], u[0]])
    if n[1] < 0:
        n = -n
    ts = np.linspace(20, np.linalg.norm(tip - P) + 24, 40)
    up = [P + u * t - n * (sh["up"] - sh["up_tip_narrow"] * np.clip((t - sh["up_tip_t"]) / 25, 0, 1)) for t in ts]
    dn = [P + u * t + n * (sh["down"] + sh["down_extra"] * np.clip((t - sh["down_t0"]) / sh["down_ramp"], 0, 1)
                           * (1 - np.clip((t - sh["down_t1"]) / sh["down_end_ramp"], 0, 1))) for t in ts]
    return [tuple(q) for q in up + dn[::-1]]


def build(v):
    R = cv2.imread(cfg.w("rect_%s.png" % v)).astype(np.float32)
    P = np.array(geom(cfg, v)["P"])
    TIP = np.array(HD["needle_tip"], float)
    yy0, xx0 = np.mgrid[:H, :W]
    rC = np.hypot(xx0 - C[0], yy0 - C[1])

    a_static = cv2.dilate(poly_mask(HD["static"].values()), k(5))      # include the polished edge bevel
    a_needle = poly_mask([needle_poly(P, TIP, 13.0, 5.0)])
    a_cw = poly_mask([HD["counterweight_photo"]])
    a_sec = np.maximum(a_needle, a_cw)
    a_hub = disc(P, HD["hub_radius"])
    sc = HD["stack_core"]
    stack_core = disc(P + sc["offset"], sc["radius"])
    a_needle_wide = poly_mask([needle_zone_poly(P, TIP, cfg["needle_shadow"])])

    def zone(alpha, reach):
        m = cv2.dilate((alpha > 0.01).astype(np.uint8), k(11))
        z = m.copy()
        for dy in range(4, reach + 1, 4):
            z |= cv2.warpAffine(m, np.float32([[1, 0, dy * 0.15], [0, 1, dy]]), (W, H), flags=cv2.INTER_NEAREST)
        return z

    # ---- what to rebuild: moving parts + their shadows, never protected print
    cw_zone = zone(a_cw, cfg["counterweight_shadow_reach"])
    remove = (cw_zone | zone(a_needle_wide, 0)).astype(np.uint8)
    L = lab(R)
    chroma = np.hypot(L[..., 1] - 128, L[..., 2] - 128)
    anything = np.maximum.reduce([a_static, a_sec, a_needle_wide, stack_core])
    near = cv2.dilate((anything > 0.01).astype(np.uint8), k(19)) > 0
    near_mv = cv2.dilate(((a_sec > 0.01) | (a_needle_wide > 0.01) | (stack_core > 0.01)).astype(np.uint8), k(19)) > 0
    edge = near_mv & ((L[..., 0] < 160) | (L[..., 1] - 128 > 3.5)) & (rC < RD["dial_field_max"]) & (a_static < 0.01)
    remove = (remove | cv2.dilate(edge.astype(np.uint8), k(3))).astype(np.uint8)

    textp = (L[..., 0] < 85) & (chroma < 16) & ~near & box_mask(PR["text_boxes"])
    textp |= (L[..., 1] - 128 > 5) & (L[..., 0] > 150) & ~near
    remove[cv2.dilate(textp.astype(np.uint8), k(7)) > 0] = 0
    keep_boxes = box_mask(PR["keep_boxes"])
    remove[keep_boxes] = 0

    needle_core = poly_mask([needle_poly(P, TIP, 17, 10)]) > 0.01
    corr = cv2.dilate((a_needle_wide > 0.01).astype(np.uint8), k(5)) > 0
    # applied indices: rose metal blobs on the index ring, protected by their convex hull
    m0, m1 = RD["markers"]
    mk = (L[..., 1] - 128 > 2.2) & (L[..., 2] - 128 > 8) & (L[..., 0] > 120) & (rC > m0) & (rC < m1) & ~corr
    mk = cv2.morphologyEx(mk.astype(np.uint8), cv2.MORPH_OPEN, k(5))
    mk = cv2.morphologyEx(mk, cv2.MORPH_CLOSE, k(15))
    marker = np.zeros((H, W), np.uint8)
    ncomp, lbl, stats, _ = cv2.connectedComponentsWithStats(mk)
    for i in range(1, ncomp):
        if stats[i, cv2.CC_STAT_AREA] >= PR["marker_min_area"]:
            pts = np.column_stack(np.where(lbl == i))[:, ::-1].astype(np.int32)
            cv2.fillConvexPoly(marker, cv2.convexHull(pts), 1)
    marker = (cv2.dilate(marker, k(7)) > 0) & ~corr
    remove[marker] = 0
    t0, t1 = RD["ticks"]
    tick = (L[..., 0] < 150) & (chroma < 16) & (rC > t0) & (rC < t1) & \
        (cv2.dilate((a_needle_wide > 0.01).astype(np.uint8), k(9)) == 0)
    remove[cv2.dilate(tick.astype(np.uint8), k(5)) > 0] = 0
    marker_needle = (cv2.dilate(marker.astype(np.uint8), k(25)) > 0) & corr & (rC > m0)

    dialish = ((L[..., 0] > 165) & (chroma < 16) & (L[..., 1] - 128 < 3.5) & (remove == 0)).astype(np.uint8)
    dialish = cv2.erode(dialish, k(3))
    dialish[cv2.dilate((L[..., 0] < 150).astype(np.uint8), k(13)) > 0] = 0
    hole = remove > 0

    # ---- clean plate: smooth base from the hole boundary + fine texture from a rotated copy
    wv = ((~hole) & (cv2.dilate(remove, k(3)) == 0)).astype(np.float32)
    base = cv2.GaussianBlur(fill_multiscale(R, wv, (3, 6, 12, 24, 48, 96, 192), 0.25), (0, 0), 2)
    tr0, tr1 = RD["track"]
    track = (rC > tr0) & (rC < tr1)
    dl = (dialish > 0).astype(np.float32)
    tickish = (L[..., 0] < 150) & (chroma < 16)
    detail = np.where((dl > 0)[..., None] | (track & tickish & ~marker)[..., None], R - nconv(R, dl, 5), 0)
    src_valid = ((dialish > 0) | (track & tickish & ~marker & ~hole)).astype(np.uint8)
    det_fill = np.zeros_like(R)
    done = ~hole
    for deg in [30, -30, 24, -24, 36, -36, 18, -18, 42, -42, 48, -48, 60, -60, 12, -12, 72, -72, 90, -90,
                120, -120, 150, -150, 180]:
        use = ~done & (rot(src_valid, deg, cv2.INTER_NEAREST) > 0)
        if use.any():
            det_fill[use] = rot(detail.astype(np.float32), deg)[use]
            done |= use
    print("  texture coverage of rebuilt area: %.1f%%" % (100 * (done & hole).sum() / hole.sum()))
    feather = cv2.GaussianBlur(remove.astype(np.float32), (0, 0), 1.2)[..., None]
    clean = R * (1 - feather) + (base + det_fill) * feather

    # ---- needle corridor: same dial region rotated +-30/60 deg, gain-matched on a ring around the corridor
    corr_hole = hole & corr & (cw_zone == 0) & (rC > RD["corridor_min"])
    good_src = (((dialish > 0) | (track & tickish & ~marker)) & ~hole).astype(np.uint8)
    protect_fill = marker | (cv2.dilate((a_static > 0.01).astype(np.uint8), k(7)) > 0) | (stack_core > 0.01) | \
        ((L[..., 0] < 120) & ~corr_hole)
    radial = np.clip((rC - RD["corridor_rotated_from"]) / 100, 0, 1)[..., None]   # near the hub keep boundary fill
    filled = np.zeros((H, W), bool)
    for deg in (30, -30, 60, -60):
        ok = (rot(good_src, deg, cv2.INTER_NEAREST) > 0) & corr_hole & ~filled
        if not ok.any():
            continue
        Rr = rot(R, deg)
        ring = (cv2.dilate(corr_hole.astype(np.uint8), k(41)) > 0) & ~corr_hole & ~protect_fill
        ring &= (dialish > 0) & (rot(dialish, deg, cv2.INTER_NEAREST) > 0)
        ratio = cv2.GaussianBlur(R, (0, 0), 4) / np.maximum(cv2.GaussianBlur(Rr, (0, 0), 4), 1)
        gainc = cv2.GaussianBlur(fill_multiscale(ratio, ring.astype(np.float32), (10, 20, 40, 80, 160), 0.15,
                                                 init=np.ones_like(R)), (0, 0), 6)
        soft = cv2.GaussianBlur((ok & corr_hole).astype(np.float32), (0, 0), 3.0)[..., None] * radial
        soft[protect_fill] = 0
        clean = clean * (1 - soft) + (Rr * gainc) * soft
        filled |= ok
    print("  needle corridor not covered by rotated copy: %d px" % (corr_hole & ~filled).sum())
    if marker_needle.any():                              # where the needle crossed an index: from index metal
        clean = cv2.inpaint(np.clip(clean, 0, 255).astype(np.uint8), marker_needle.astype(np.uint8) * 255, 7,
                            cv2.INPAINT_TELEA).astype(np.float32)

    # ---- minute ticks inside the rebuilt area: contrast vs background copied from the ticks 30 deg away
    z0, z1 = RD["tick_zone"]
    tick_zone = hole & (rC > z0) & (rC < z1) & ~marker
    if tick_zone.any():
        bg_R = nconv(R, ((L[..., 0] > 150) & (chroma < 18)).astype(np.float32), 8)
        Lc = lab(clean)[..., 0]
        bg_C = cv2.GaussianBlur(fill_multiscale(clean, ((Lc > 150) & ~tick_zone).astype(np.float32),
                                                (8, 16, 32, 64, 128), 0.2), (0, 0), 3)
        out = clean.copy()
        out[tick_zone] = bg_C[tick_zone]
        done_t = np.zeros((H, W), bool)
        for deg in (30, -30, 60, -60):
            ok = (rot(hole.astype(np.uint8), deg, cv2.INTER_NEAREST) == 0) & \
                (rot(marker.astype(np.uint8), deg, cv2.INTER_NEAREST) == 0)
            use = tick_zone & ok & ~done_t
            if use.any():
                rel = np.clip(rot(R, deg) / np.maximum(rot(bg_R, deg), 1), 0.3, 1.05)
                out[use] = (bg_C * rel)[use]
                done_t |= use
        soft = cv2.GaussianBlur(tick_zone.astype(np.float32), (0, 0), 1.0)[..., None]
        clean = clean * (1 - soft) + out * soft

    # ---- static hands: photo pixels; parts hidden by the seconds hand refilled along the hand edge
    static_col = R.copy()
    sec_cover = cv2.dilate((a_sec > 0.01).astype(np.uint8), k(9)) & (disc(P, HD["hub_radius"]) < 0.5)
    for name, f in HD["static_fill"].items():
        poly = HD["static"][name]
        alpha = poly_mask([poly])
        a, b = np.array(poly[f["edge"][0]], float), np.array(poly[f["edge"][1]], float)
        d = (b - a) / np.linalg.norm(b - a)
        fill = cv2.warpAffine(R, np.float32([[1, 0, -d[0] * f["shift"]], [0, 1, -d[1] * f["shift"]]]), (W, H),
                              flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        fix = (alpha > 0) & (sec_cover > 0)
        soft = cv2.GaussianBlur(fix.astype(np.float32), (0, 0), 2.5)[..., None] * (alpha > 0)[..., None]
        static_col = static_col * (1 - soft) + fill * soft
    handish = cv2.morphologyEx(((L[..., 1] - 128 > 3.0) | (L[..., 0] < 165)).astype(np.uint8), cv2.MORPH_CLOSE, k(5))
    a_stack = cv2.GaussianBlur((stack_core > 0.5).astype(np.float32) * handish, (0, 0), 1.0)
    stubs = cv2.dilate(((a_sec > 0.01) & (disc(P, HD["hub_radius"] - 2) < 0.5)).astype(np.uint8), k(7))
    stubs &= (stack_core > 0.01).astype(np.uint8)
    static_col = cv2.inpaint(np.clip(static_col, 0, 255).astype(np.uint8), stubs * 255, 6,
                             cv2.INPAINT_TELEA).astype(np.float32)
    a_static = cv2.GaussianBlur(np.maximum(a_static, a_stack), (0, 0), 0.6)

    # ---- seconds hand: symmetric vector shape with widths measured on the photo
    u0 = (TIP - P) / np.linalg.norm(TIP - P)
    n0 = np.array([-u0[1], u0[0]])
    meas = []
    for t in range(*HD["needle_measure_t"], 20):
        ss = np.arange(-24, 24.5, 0.5)
        Ap = np.mean([samp(L[..., 1], [P + u0 * (t + dt) + n0 * q for q in ss]) for dt in range(-6, 7, 2)], 0) - 128
        rose = Ap > 3.0
        if rose.sum() >= 6:
            lo, hi = ss[np.where(rose)[0].min()], ss[np.where(rose)[0].max()]
            meas.append((t, (lo + hi) / 2, (hi - lo) / 2))
    meas = np.array(meas)
    wfit = np.polyfit(meas[:, 0], meas[:, 2], 1)
    ang = np.arctan(np.sum(meas[:, 0] * meas[:, 1]) / np.sum(meas[:, 0] ** 2))   # centre line through the pivot
    print("  needle half-width %.2f %+.4f*t px, axis correction %.3f deg" % (wfit[1], wfit[0], np.degrees(ang)))
    u_n = u0 * np.cos(ang) + n0 * np.sin(ang)
    u_n /= np.linalg.norm(u_n)
    n_n = np.array([-u_n[1], u_n[0]])
    Ln = np.linalg.norm(TIP - P)
    wc0, wc1 = HD["needle_width_clip"]

    def hw_needle(t):
        t = np.asarray(t, np.float32)
        return np.polyval(wfit, np.clip(t, wc0, wc1)).astype(np.float32) * \
            np.sqrt(np.clip((Ln - t) / HD["needle_tip_taper"], 0, 1))

    def strip(M0, u, n, ts, hw_fn, s_lo, s_hi):
        hw = hw_fn(ts)
        return [tuple(M0 + u * t + n * (s_lo * h)) for t, h in zip(ts, hw)] + \
            [tuple(M0 + u * t + n * (s_hi * h)) for t, h in zip(ts, hw)][::-1]

    E = HD["edge_fraction"]
    ts_n = np.linspace(0, Ln, 120)
    u_c = -u_n
    n_c = np.array([-u_c[1], u_c[0]])
    cwd = HD["counterweight"]
    ts_c = np.linspace(0.0, cwd["length"], 30)
    hw_c = lambda t: np.full(np.shape(t), cwd["half_width"], np.float32)
    parts = {   # name: (polygon, outward normal in the dial plane at the photo's orientation)
        "n_face_L": (strip(P, u_n, n_n, ts_n, hw_needle, -(1 - E), 0), -n_n),
        "n_face_R": (strip(P, u_n, n_n, ts_n, hw_needle, 0, 1 - E), n_n),
        "n_edge_L": (strip(P, u_n, n_n, ts_n, hw_needle, -1, -(1 - E)), -n_n),
        "n_edge_R": (strip(P, u_n, n_n, ts_n, hw_needle, 1 - E, 1), n_n),
        "c_face": (strip(P, u_c, n_c, ts_c, hw_c, -0.8, 0.8), np.zeros(2)),
        "c_edge_L": (strip(P, u_c, n_c, ts_c, hw_c, -1, -0.8), -n_c),
        "c_edge_R": (strip(P, u_c, n_c, ts_c, hw_c, 0.8, 1), n_c),
    }
    f0, f1 = HD["needle_face_t"]
    face_pts = [P + u_n * t + n_n * q for t in range(f0, f1, 4) for q in (-3, -1, 1, 3, 5)]
    needle_face = np.median(np.stack([samp(R[..., ch], face_pts) for ch in range(3)], 1), 0)
    np.savez_compressed(cfg.w("hand_%s.npz" % v), P=P, u_n=u_n, needle_face=needle_face, length=Ln,
                        names=np.array(list(parts)),
                        masks=np.stack([poly_mask([p]).astype(np.float16) for p, _ in parts.values()]),
                        normals=np.array([nr for _, nr in parts.values()]))
    np.savez_compressed(cfg.w("layers_%s.npz" % v), clean=np.clip(clean, 0, 255).astype(np.uint8),
                        static_col=np.clip(static_col, 0, 255).astype(np.uint8), a_static=a_static.astype(np.float16),
                        a_hub=a_hub.astype(np.float16), remove=remove, marker=marker, P=P)
    crop = (slice(550, 1400), slice(700, 2150))
    cv2.imwrite(cfg.w("preview_clean_%s.jpg" % v),
                cv2.resize(np.clip(np.hstack([R[crop], clean[crop]]), 0, 255).astype(np.uint8), None, fx=0.5, fy=0.5,
                           interpolation=cv2.INTER_AREA))


for v in cfg.variants(args[0] if args else None):
    print(v)
    build(v)
