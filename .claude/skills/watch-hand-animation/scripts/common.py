"""Shared config, paths and image helpers for the watch-hand-animation pipeline."""
import json
import os
import sys

import cv2
import numpy as np

RECT_SIZE = 2400            # rectified dial image (rect4x), dial centre at the middle
C = np.array([RECT_SIZE / 2, RECT_SIZE / 2])


class Cfg:
    def __init__(self, config_path):
        self.path = os.path.abspath(config_path)
        self.dir = os.path.dirname(self.path)
        self.slug = os.path.basename(self.dir)
        with open(self.path) as f:
            self.d = json.load(f)
        root = self.dir
        while not os.path.isdir(os.path.join(root, ".git")) and os.path.dirname(root) != root:
            root = os.path.dirname(root)
        self.root = root
        self.work = os.path.join(root, "tmp", "hand-anim", self.slug)
        os.makedirs(self.work, exist_ok=True)

    def __getitem__(self, k):
        return self.d[k]

    def source(self, variant):
        return os.path.join(self.dir, self.d["variants"][variant]["source"])

    def w(self, name):
        return os.path.join(self.work, name)

    def variants(self, arg):
        return list(self.d["variants"]) if arg in (None, "all") else [arg]


def parse(argv, usage):
    if len(argv) < 2:
        sys.exit("usage: " + usage)
    return Cfg(argv[1]), argv[2:]


def geom(cfg, variant):
    with open(cfg.w("geom_%s.json" % variant)) as f:
        return json.load(f)


def poly_mask(polys, shape=(RECT_SIZE, RECT_SIZE)):
    m = np.zeros(shape, np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.round(np.array(p, float) * 8).astype(np.int32)], 255, cv2.LINE_AA, shift=3)
    return m.astype(np.float32) / 255


def disc(center, r, shape=(RECT_SIZE, RECT_SIZE)):
    yy, xx = np.ogrid[:shape[0], :shape[1]]
    return np.clip(r + 0.5 - np.hypot(xx - center[0], yy - center[1]), 0, 1).astype(np.float32)


def rot(img, deg, interp=cv2.INTER_CUBIC, border=0):
    """rotate about the dial centre (positive = counter-clockwise on screen)"""
    M = cv2.getRotationMatrix2D((float(C[0]), float(C[1])), deg, 1.0)
    return cv2.warpAffine(img, M, (img.shape[1], img.shape[0]), flags=interp,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=border)


def nconv(img, w, sig):
    """normalized convolution: blur img using only pixels where w > 0"""
    return cv2.GaussianBlur(img * w[..., None], (0, 0), sig) / \
        np.maximum(cv2.GaussianBlur(w, (0, 0), sig), 1e-3)[..., None]


def fill_multiscale(img, w, sigmas, thresh, init=None):
    """fill every pixel from the smallest scale that has enough trusted support (else keep init/img)"""
    out = img.copy() if init is None else init.copy()
    got = np.zeros(img.shape[:2], bool)
    for sg in sigmas:
        den = cv2.GaussianBlur(w, (0, 0), sg)
        ok = (den > thresh) & ~got
        out[ok] = nconv(img, w, sg)[ok]
        got |= ok
    return out


def samp(img, pts):
    m = np.float32(pts)
    return cv2.remap(img, m[:, 0].reshape(1, -1), m[:, 1].reshape(1, -1), cv2.INTER_LINEAR)[0]


def lab(img):
    return cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)


def box_mask(boxes, shape=(RECT_SIZE, RECT_SIZE)):
    m = np.zeros(shape, bool)
    for x0, y0, x1, y1 in boxes:
        m[y0:y1, x0:x1] = True
    return m
