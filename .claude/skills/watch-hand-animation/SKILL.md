---
name: watch-hand-animation
description: Turn a still watch photo into a seamless 60 s video loop with a ticking seconds hand (hero section, possibly watch cards). Semi-automatic - Claude measures the dial on zoomed grid crops, the pipeline removes the photo's seconds hand + its shadow, rebuilds the dial, draws a clean symmetric hand and renders light/dark variants. Use when asked to animate / "rozhýbať" hands of a watch photo or to fix defects in an existing hand animation.
---

# Watch hand animation

Pipeline lives in `scripts/`, one config + source photos per watch in `configs/<slug>/`.
Reference config (fully tuned, deployed in the hero): `configs/conquest-calendar/config.json`.
Work files go to `tmp/hand-anim/<slug>/` (git-ignored). Run everything through `scripts/run.sh`
(creates its own venv with numpy + opencv; needs ffmpeg).

```bash
S=.claude/skills/watch-hand-animation/scripts; CFG=.claude/skills/watch-hand-animation/configs/<slug>/config.json
$S/run.sh fit $CFG            # rectify dial (homography from the minute-track squares)
$S/run.sh build $CFG          # clean dial + layers + vector seconds hand
$S/run.sh check $CFG          # numeric acceptance checks - must print ALL CHECKS PASSED
$S/run.sh render $CFG preview # contact sheet: photo + 5 hand positions
$S/run.sh render $CFG video v4   # 60 s loop + poster for every variant -> public/hero/watch-<v>.v4.*
$S/run.sh render $CFG mask v4    # static alpha mask (watch + shadow) -> public/hero/watch-<v>.v4.png
$S/run.sh measure $CFG grid|squares|overlay ...   # measuring helpers (see below)
```

## Scope / when it works
- Centre seconds hand, dial with a regular minute track (squares / dots every 5 min), photo sharp enough to
  see the needle's edges. Sub-seconds dials, heavy glass reflections or a needle hidden under other hands need
  extra work - say so up front.
- Hour and minute hands stay still (a moving minute hand would jump at the loop seam). The seconds hand
  steps at the movement's beat rate (`render.beats_per_second`, 5.5 for 19,800 vph) and does one full turn
  in 60 s, so the loop is seamless.
- Light and dark site themes need two photos of the same watch on white / black background that are aligned
  to each other (same framing). Align them first if they are not (feature matching, < 1 px).

## Workflow for a new watch
1. **Set up**: `mkdir configs/<slug>`, copy the untouched source photo(s) there (never the site's poster - the
   site file gets replaced by renders), copy `configs/conquest-calendar/config.json` as a template.
2. **Squares** (semi-automatic, the core of the setup): look at the photo, estimate the centres of 6-8
   minute-track squares spread around the dial, write them into `variants.<v>.squares` with their clock angle
   (deg clockwise from 12). Refine with `measure squares <v>` (8x tiles, 4 px grid) until the cross sits in each
   square's centre. `fit` must report residual < 1.5 px - a larger value means a wrong angle label or a bad
   centre. Also set `hub` (centre of the pivot cap) in photo px.
3. **Everything else is in rect4x space** (rectified dial, 2400x2400, centre 1200,1200, minute-track squares at
   radius 752). Run `fit`, then `measure grid <v> rect x0 y0 x1 y1` around each item and fill in:
   `hands.needle_tip`, static hand polygons (`hands.static`), the photo's counterweight outline,
   `protect.text_boxes` (logo, printed text), `protect.keep_boxes` (date window), `radii` (index ring, track).
   Check with `measure overlay <v>`.
4. `build` -> look at `preview_clean_<v>.jpg` (photo | clean dial). Then `check`, then `render preview`.
5. Show the user the preview (SendUserFile) and **ask them to look at it** - they will catch things the
   numbers miss. Iterate on the config / build, re-run `check`.
6. Render the video only after the user is happy with the stills (a render takes ~15-20 min per variant, both
   variants run in parallel; run it in the background).

## Deploying (hero)
- `render video <version>` writes `public/hero/watch-<variant>.<version>.mp4/.webp`, but only after verifying
  the encoded frame count (half-written files never land in `public/`).
- Also render the masks (`render mask <version>`): the hero container uses them as CSS `mask-image`
  (`.hero-masked` in `app/globals.css`), so only the watch and its shadow show and the page background is
  visible around it. This hides the H.264 colour shift of the dark background (it came out greenish).
- Dark photos: the shadow is only a few levels below the background and H.264 bands it into visible steps.
  List such variants in `mask.shadow_layer`: they get a watch-only mask plus a smooth `<name>.shadow.png`
  (black + alpha) that the page draws underneath (dark theme only).
- Bump `HERO_VERSION` in `app/page.tsx` to the same version and delete the previous version's files
  (`git mv` the old names or `git rm` them). Versioned names = browsers never show a cached old render.
- Check in the browser pane that both themes load the new files (`data-theme` toggle, `readyState` 4, no
  error). Commit page + media together.
- For watch cards the same pipeline applies; add an `output` block per card (e.g.
  `public/watches/<ref>/hand.<version>.mp4`) and a 4:5 crop step - not built yet.

## Hard-won rules (each one was a visible defect the user caught)
- **Never rotate photo pixels of the seconds hand.** Its dark edge / shadow is baked in on one side and ends up
  on the wrong side when rotated -> asymmetric, "deformed" hand. Draw it as a vector shape with widths measured
  on the photo; shade the edges per frame from the angle to the light (`render.light_dir`).
- **Remove only what moves** (needle, counterweight and their shadows). Removing the static hands' shadows
  leaves light patches near the hub and at 3 o'clock.
- **The needle's photo shadow is wide** (here up to ~100-150 px below the needle, rect4x) - measure the
  brightness profile across the needle and size `needle_shadow` from it, otherwise a grey band stays at the
  needle's start position.
- **Refill the needle path from the same dial region rotated 30 deg**, gain-matched on a ring of unshadowed
  dial around the corridor. Filling from the corridor boundary inherits the index's shadow (dark band).
- **Protect applied indices with their full convex hull** (colour detection alone misses the dark bevels -> the
  index gets "degraded"). Where the needle crossed an index, inpaint from the index metal.
- **Minute ticks inside the rebuilt area**: copy only their contrast vs. the local background from the ticks 30
  deg away, once. Darkening twice gives thick black ticks.
- **The per-frame redraw region must contain the whole circle the hand sweeps** (otherwise the hand is cut off
  between 3 and 7 o'clock).
- Keep the counterweight collinear with the needle through the pivot.
- Poster = first video frame, so the video starts without a jump; reduced-motion users see the poster.
- Background renders: write to the work dir and move into `public/` at the end; never commit while a render
  is still writing.

## Checks (`check.py`)
- *ghost*: profile across the original needle path with the hand moved away, vs. the same corridor rotated
  +-30/60 deg. Fails if the deviation exceeds the dial's natural variation by > 3 L.
- *indices*: mean colour difference of all applied indices vs. the photo must stay ~0.
- *hand*: left/right half-width asymmetry < 1 px and constant reach at 0/90/180/270 deg.
Numbers pass != done: always compare crops at the user's zoom level with the photo before shipping.
