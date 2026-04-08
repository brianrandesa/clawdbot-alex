# Asset Drop Guide — Kickass Cashflow Remotion Ads

## For Jenna (or whoever is supplying creative assets)

Drop all files into `remotion-video/public/` and they'll be available
at the root `/` path inside compositions.

### Required Assets

| File                  | Specs                          | Used In               |
|-----------------------|--------------------------------|-----------------------|
| `anna-headshot.jpg`   | 400×400px min, square crop     | StaticAd2Authority    |

> **Once `anna-headshot.jpg` is in `public/`**, flip the flag in
> `src/compositions/static/StaticAd2Authority.tsx`:
> ```ts
> const USE_HEADSHOT = true;
> ```

### Optional / Future Assets

| File                  | Specs                          | Used In               |
|-----------------------|--------------------------------|-----------------------|
| `logo-kickass.svg`    | SVG, white on transparent      | All CTAs              |
| `bg-texture.jpg`      | 1080×1080 or 1080×1920, dark   | Backgrounds           |
| `testimonial-1.mp4`   | 1080×1920, < 30s               | VideoAd3SocialProof   |
| `testimonial-2.mp4`   | 1080×1920, < 30s               | VideoAd3SocialProof   |

### Fonts

The compositions reference these Google Fonts:
- **Montserrat** (weight 900) — headings
- **DM Sans** (weight 400, 700) — body copy
- **Caveat** (weight 400) — handwritten accents

These load from the system / Google Fonts. No local files needed unless
you want to bundle them for offline rendering.

### Rendering

```bash
cd remotion-video

# Preview in browser
npm start

# Render a single composition
npx remotion render src/index.ts StaticAd1PainHook out/static-pain-hook.mp4

# Render a still/thumbnail at frame 90
npx remotion still src/index.ts StaticAd1PainHook out/thumb-pain-hook.png --frame=90

# Render all (run each command)
npx remotion render src/index.ts VideoAd1PainHook    out/video-pain-hook.mp4
npx remotion render src/index.ts VideoAd2OriginStory out/video-origin-story.mp4
npx remotion render src/index.ts VideoAd3SocialProof out/video-social-proof.mp4
```
