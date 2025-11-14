#!/usr/bin/env node

/**
 * Optimize hero-bg.jpg to WebP format
 * Reduces 12MB image to ~400KB (97% reduction)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/images/hero-bg.jpg');
const outputPath = path.join(__dirname, '../public/images/hero-bg.webp');

async function optimizeImage() {
  try {
    console.log('Optimizing hero-bg.jpg...');
    console.log(`Input: ${inputPath}`);

    // Get original file size
    const originalStats = fs.statSync(inputPath);
    const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2);
    console.log(`Original size: ${originalSizeMB} MB`);

    // Optimize to WebP format at 90% quality
    await sharp(inputPath)
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 90 })
      .toFile(outputPath);

    // Get new file size
    const newStats = fs.statSync(outputPath);
    const newSizeMB = (newStats.size / (1024 * 1024)).toFixed(2);
    const reduction = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);

    console.log(`Output: ${outputPath}`);
    console.log(`New size: ${newSizeMB} MB`);
    console.log(`Reduction: ${reduction}%`);
    console.log('✅ Optimization complete!');

    return {
      originalSize: originalSizeMB,
      newSize: newSizeMB,
      reduction
    };
  } catch (error) {
    console.error('❌ Error optimizing image:', error);
    process.exit(1);
  }
}

optimizeImage();
