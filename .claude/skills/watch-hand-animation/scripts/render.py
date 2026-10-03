"""Step 3: render.

usage: render.py <config.json> preview|video <version> [dark|light|all]
  preview          contact sheet (photo + 5 hand positions) -> tmp/hand-anim/<slug>/preview_<v>.jpg
  video <version>  60 s loop + poster (first frame, full photo size) rendered to the work dir, then moved to
                   <output.dir>/<basename>-<v>.<version>.mp4 / .webp  (all variants run in parallel)
"""
import os
import shutil
import subprocess
import sys

import cv2
import numpy as np

from common import Cfg, geom


class Renderer:
    def __init__(self, cfg, v):
        rc = cfg["render"]
        self.fps, self.secs, self.bps, self.size, self.crf = rc["fps"], rc["seconds"], rc["beats_per_second"], \
            rc["size"], rc["crf"]
        sd = np.array(rc["shadow_dir"], float)
        self.sh_dir = sd / np.linalg.norm(sd)
        self.sh = rc["hand_shadow"]
        self.light = np.array(rc["light_dir"], np.float32)
        Hm = np.diag([4, 4, 1]) @ np.array(geom(cfg, v)["H"])
        self.Hinv = np.linalg.inv(Hm)
        z = np.load(cfg.w("layers_%s.npz" % v))
        hz = np.load(cfg.w("hand_%s.npz" % v))
        self.P = np.array(z["P"], float)
        self.src = cv2.imread(cfg.source(v)).astype(np.float32)
        self.Hs, self.Ws = self.src.shape[:2]
        self.full = cv2.imread(cfg.w("rect_%s.png" % v)).astype(np.float32)
        RH, RW = self.full.shape[:2]
        reach = float(hz["length"]) + rc["sweep_margin"]
        m = int(reach + 20)
        self.y0, self.y1 = max(0, int(self.P[1]) - m), min(RH, int(self.P[1]) + m)
        self.x0, self.x1 = max(0, int(self.P[0]) - m), min(RW, int(self.P[0]) + m)
        roi = self.roi
        self.h, self.w = self.y1 - self.y0, self.x1 - self.x0
        self.Pr = (self.P[0] - self.x0, self.P[1] - self.y0)
        a_static = z["a_static"].astype(np.float32)
        self.base = self._over(roi(z["clean"].astype(np.float32)), roi(z["static_col"].astype(np.float32)),
                               roi(a_static))
        self.a_hub, self.hub_col = roi(z["a_hub"].astype(np.float32)), roi(self.full)
        self.names = list(hz["names"])
        self.masks = [roi(mk.astype(np.float32)) for mk in hz["masks"]]
        self.normals = hz["normals"].astype(np.float32)
        self.face = hz["needle_face"].astype(np.float32)
        yy, xx = np.mgrid[:RH, :RW]
        changed = np.maximum((np.hypot(xx - self.P[0], yy - self.P[1]) < reach).astype(np.float32),
                             (z["remove"] > 0).astype(np.float32))
        self.blend = cv2.warpPerspective(cv2.GaussianBlur(changed, (0, 0), 3), self.Hinv, (self.Ws, self.Hs))[..., None]
        self.S = min(self.Ws, self.Hs)
        self.ox, self.oy = (self.Ws - self.S) // 2, (self.Hs - self.S) // 2

    def roi(self, a):
        return a[self.y0:self.y1, self.x0:self.x1]

    @staticmethod
    def _over(img, col, a):
        return img * (1 - a[..., None]) + col * a[..., None]

    def hand(self, deg):
        """rotate the vector hand; each facet/edge is shaded by its orientation to the light"""
        M = cv2.getRotationMatrix2D(self.Pr, -deg, 1.0)
        th = np.radians(deg)
        Rm = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]], np.float32)
        acc = np.zeros((self.h, self.w, 3), np.float32)
        alpha = np.zeros((self.h, self.w), np.float32)
        wsum = np.zeros((self.h, self.w), np.float32)
        for name, m, nr in zip(self.names, self.masks, self.normals):
            mr = cv2.warpAffine(m, M, (self.w, self.h), flags=cv2.INTER_LINEAR)
            if name == "c_face":
                shade = 1.0
            else:
                d = float(np.dot(Rm @ nr, self.light))      # +1 facing the light, -1 away
                if "edge" in name:
                    shade = 0.62 + 0.30 * d if d < 0 else 1.0 + 0.10 * d
                else:
                    shade = 1.0 + 0.05 * d
            col = self.face * (0.97 if name.startswith("c_") else 1.0) * shade
            acc += mr[..., None] * col
            alpha = np.maximum(alpha, mr)
            wsum += mr
        return np.clip(alpha, 0, 1), acc / np.maximum(wsum, 1e-4)[..., None]

    def compose_rect(self, t):
        """full rect4x image at time t (used by check.py)"""
        deg = 6.0 * np.floor(t * self.bps + 1e-9) / self.bps
        a, c = self.hand(deg)
        off, sig, strength = self.sh
        sa = cv2.warpAffine(a, np.float32([[1, 0, self.sh_dir[0] * off], [0, 1, self.sh_dir[1] * off]]),
                            (self.w, self.h), flags=cv2.INTER_LINEAR)
        img = self.base * (1 - strength * cv2.GaussianBlur(sa, (0, 0), sig)[..., None])
        img = self._over(img, c, a)
        img = self._over(img, self.hub_col, self.a_hub)
        out = self.full.copy()
        out[self.y0:self.y1, self.x0:self.x1] = img
        return out

    def frame(self, t, square=True):
        back = cv2.warpPerspective(self.compose_rect(t), self.Hinv, (self.Ws, self.Hs), flags=cv2.INTER_AREA)
        out = np.clip(self.src * (1 - self.blend) + back * self.blend, 0, 255).astype(np.uint8)
        if not square:
            return out
        return cv2.resize(out[self.oy:self.oy + self.S, self.ox:self.ox + self.S], (self.size, self.size),
                          interpolation=cv2.INTER_AREA)

    def video(self, path):
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
                               "-s", "%dx%d" % (self.size, self.size), "-r", str(self.fps), "-i", "-",
                               "-c:v", "libx264", "-preset", "slow", "-crf", str(self.crf), "-pix_fmt", "yuv420p",
                               "-movflags", "+faststart", "-an", path], stdin=subprocess.PIPE)
        n = int(round(self.secs * self.fps))
        for i in range(n):
            ff.stdin.write(self.frame(i / self.fps).tobytes())
            if i % 300 == 0:
                print("  frame %d / %d" % (i, n), flush=True)
        ff.stdin.close()
        if ff.wait() != 0:
            sys.exit("ffmpeg failed")


def preview(cfg, v):
    r = Renderer(cfg, v)
    orig = cv2.resize(r.src[r.oy:r.oy + r.S, r.ox:r.ox + r.S], (r.size, r.size), interpolation=cv2.INTER_AREA)
    tiles = [orig.astype(np.uint8)] + [r.frame(t) for t in (0, 10, 26.4, 36.4, 46.4)]
    # zoom on the dial: centre = hub, half-size = 1.25 x the minute-track square radius (photo px -> frame px)
    var = cfg["variants"][v]
    hub = np.array(var["hub"], float)
    rad = 1.25 * max(np.hypot(*(np.array(s["xy"]) - hub)) for s in var["squares"])
    f = r.size / r.S
    cx, cy, hr = (hub[0] - r.ox) * f, (hub[1] - r.oy) * f, rad * f
    x0, y0 = int(max(0, cx - hr)), int(max(0, cy - hr))
    x1, y1 = int(min(r.size, cx + hr)), int(min(r.size, cy + hr))
    tiles = [cv2.resize(np.ascontiguousarray(t[y0:y1, x0:x1]), (540, 540), interpolation=cv2.INTER_CUBIC)
             for t in tiles]
    for t, label in zip(tiles, ["photo", "0 s", "10 s", "26 s", "36 s", "46 s"]):
        cv2.putText(t, label, (8, 26), 0, 0.8, (0, 0, 255), 2)
    sheet = np.vstack([np.hstack(tiles[:3]), np.hstack(tiles[3:])])
    cv2.imwrite(cfg.w("preview_%s.jpg" % v), sheet)
    print("wrote", cfg.w("preview_%s.jpg" % v))


def video(cfg, v, version):
    r = Renderer(cfg, v)
    tmp_mp4, tmp_webp = cfg.w("out_%s.mp4" % v), cfg.w("out_%s.webp" % v)
    r.video(tmp_mp4)
    cv2.imwrite(tmp_webp, r.frame(0, square=False), [cv2.IMWRITE_WEBP_QUALITY, 92])
    frames = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
                             "stream=nb_read_frames", "-of", "csv=p=0", tmp_mp4], capture_output=True, text=True)
    expected = int(round(r.secs * r.fps))
    if frames.stdout.strip() != str(expected):
        sys.exit("%s: encoded %s frames, expected %d - not moving it into the site" % (v, frames.stdout.strip(), expected))
    o = cfg["output"]
    dst = os.path.join(cfg.root, o["dir"], "%s-%s.%s" % (o["basename"], v, version))
    shutil.move(tmp_mp4, dst + ".mp4")
    shutil.move(tmp_webp, dst + ".webp")
    print("wrote", dst + ".mp4", "and .webp")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cfg, mode = Cfg(sys.argv[1]), sys.argv[2]
    if mode == "preview":
        for v in cfg.variants(sys.argv[3] if len(sys.argv) > 3 else None):
            preview(cfg, v)
    elif mode == "video":
        if len(sys.argv) < 4:
            sys.exit("video needs a version, e.g. v4")
        version = sys.argv[3]
        vs = cfg.variants(sys.argv[4] if len(sys.argv) > 4 else None)
        if len(vs) == 1:
            video(cfg, vs[0], version)
        else:
            procs = [subprocess.Popen([sys.executable, __file__, cfg.path, "video", version, v]) for v in vs]
            if any(p.wait() != 0 for p in procs):
                sys.exit("a variant failed")
    else:
        sys.exit(__doc__)
