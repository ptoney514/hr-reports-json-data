# Image Optimization

## Current Images

### hero-bg.webp (514KB)
Optimized background image for the Dashboard Index hero section.

**Optimization Details:**
- Original: hero-bg.jpg (12MB)
- Optimized: hero-bg.webp (514KB)
- **Reduction: 95.7%** (11.5MB saved)
- Format: WebP at 90% quality
- Dimensions: 1920x1080

The image is displayed with:
- A dark overlay for text readability
- Brightness reduced to 40%
- Slight contrast enhancement

## Adding New Hero Images

If you need to replace the hero background:

1. Save your ocean/coastal JPG image as `hero-bg.jpg` in this directory
2. Run the optimization script: `node scripts/optimize-hero-image.js`
3. The script will create `hero-bg.webp` automatically
4. Remove the original `hero-bg.jpg` after verification

## Logo Files

- `logo192.png` (5.2KB) - PWA icon 192x192
- `logo512.png` (9.4KB) - PWA icon 512x512

These remain as PNG for PWA compatibility.