"""Step 4: numeric acceptance checks (run before rendering the video).

usage: check.py <config.json> [dark|light|all]
  ghost    brightness profile across the ORIGINAL needle path (hand moved away, t=15 s) compared with the
           same corridor rotated +-30/60 deg -> any leftover shadow shows up as a deviation
  indices  colour difference of every applied index vs the photo (must stay ~0)
  hand     left/right half-width symmetry and reach of the rotating hand at 0/90/180/270 deg
Exit code 1 if a check fails.
"""
import sys

import cv2
import numpy as np

from common import Cfg, geom, lab
from render import Renderer

cfg = Cfg(sys.argv[1]) if len(sys.argv) > 1 else sys.exit(__doc__)
failed = []

for v in cfg.variants(sys.argv[2] if len(sys.argv) > 2 else None):
    r = Renderer(cfg, v)
    z = np.load(cfg.w("layers_%s.npz" % v))
    R = cv2.imread(cfg.w("rect_%s.png" % v))
    P = np.array(geom(cfg, v)["P"])
    tip = np.array(cfg["hands"]["needle_tip"], float)
    u0 = (tip - P) / np.linalg.norm(tip - P)
    f = np.clip(r.compose_rect(15), 0, 255).astype(np.uint8)
    L = lab(f)
    l = cv2.GaussianBlur(L[..., 0], (0, 0), 2)
    ch = np.hypot(L[..., 1] - 128, L[..., 2] - 128)
    dial = cv2.erode(((L[..., 0] > 140) & (ch < 18) & (L[..., 1] - 128 < 3)).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    SS = list(range(-100, 141, 10))

    def prof(u, seg):
        n = np.array([-u[1], u[0]])
        n = n if n[1] > 0 else -n
        out = []
        for s in SS:
            vals = [l[int(round(q[1])), int(round(q[0]))] for t in range(*seg, 3) for q in [P + u * t + n * s]
                    if dial[int(round(q[1])), int(round(q[0]))]]
            out.append(np.mean(vals) if len(vals) > 15 else np.nan)
        return np.array(out)

    Ln = float(np.load(cfg.w("hand_%s.npz" % v))["length"])
    worst_ex = 0.0
    for seg in ((120, 250), (250, 400), (400, 550), (550, int(Ln * 0.87))):
        p = prof(u0, seg)
        refs = []
        for d in (30, -30, 60, -60):
            a = np.radians(d)
            refs.append(prof(np.array([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]]) @ u0, seg))
        refs = np.array(refs)
        ref = np.nanmedian(refs, axis=0)
        natural = np.nanmax(np.abs((refs - np.nanmean(refs, 1, keepdims=True)) - (ref - np.nanmean(ref))))
        dev = np.nanmax(np.abs((p - np.nanmean(p)) - (ref - np.nanmean(ref))))
        worst_ex = max(worst_ex, dev - natural)
        print("  %s ghost seg %-11s max dev %4.1f L   natural spread %4.1f L" % (v, str(seg), dev, natural))
    if worst_ex > 3.0:
        failed.append("%s ghost: leftover shadow exceeds natural dial variation by %.1f L" % (v, worst_ex))

    mk = z["marker"].astype(bool)
    a, _ = r.hand(6.0 * 15)
    mv = np.zeros(mk.shape, np.float32)
    mv[r.y0:r.y1, r.x0:r.x1] = a
    m = mk & ~(cv2.dilate(((mv > 0.01) | (z["remove"] > 0)).astype(np.uint8), np.ones((15, 15), np.uint8)) > 0)
    dE = np.linalg.norm(L - lab(R), axis=2)
    print("  %s indices mean dE %.2f, pixels dE>10: %d" % (v, dE[m].mean(), int((dE[m] > 10).sum())))
    if dE[m].mean() > 1.0:
        failed.append("%s indices changed (mean dE %.2f)" % (v, dE[m].mean()))

    hz = np.load(cfg.w("hand_%s.npz" % v))
    u = hz["u_n"]
    Pr = np.array(r.Pr)
    asym, reach = 0.0, []
    for deg in (0, 90, 180, 270):
        a, _ = r.hand(deg)
        th = np.radians(deg)
        ur = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]]) @ u
        nr = np.array([-ur[1], ur[0]])
        for t in (150, 300, 450, 600, 750, -100, -200):
            def edge(sign):
                for s in np.arange(0, 40, 0.25):
                    q = Pr + ur * t + nr * s * sign
                    if cv2.remap(a, np.float32([[q[0]]]), np.float32([[q[1]]]), cv2.INTER_LINEAR)[0, 0] < 0.5:
                        return s
                return 40
            asym = max(asym, abs(edge(-1) - edge(1)))
        ys, xs = np.where(a > 0.5)
        reach.append(float(np.hypot(xs - Pr[0], ys - Pr[1]).max()))
    print("  %s hand asymmetry %.2f px, reach %s (length %.0f)" % (v, asym, [round(x) for x in reach], Ln))
    if asym > 1.0 or max(reach) - min(reach) > 3:
        failed.append("%s hand not symmetric / not constant length" % v)

print("\nALL CHECKS PASSED" if not failed else "\nFAILED:\n  " + "\n  ".join(failed))
sys.exit(1 if failed else 0)
