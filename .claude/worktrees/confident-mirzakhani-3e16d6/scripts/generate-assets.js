const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAssets() {
  const logoPath = path.join(__dirname, '../public/harmonize-logo.png');
  const publicDir = path.join(__dirname, '../public');
  const appDir = path.join(__dirname, '../src/app');

  // 1. Get trimmed logo buffer
  const trimmedLogoBuffer = await sharp(logoPath).trim().toBuffer();
  const trimmedMeta = await sharp(trimmedLogoBuffer).metadata();

  console.log('Trimmed logo:', trimmedMeta.width, 'x', trimmedMeta.height);

  // --- 2. Generate OG Image (1200 x 630) ---
  const maxOgLogoWidth = 820;
  const maxOgLogoHeight = 400;

  const resizedOgLogo = await sharp(trimmedLogoBuffer)
    .resize({
      width: maxOgLogoWidth,
      height: maxOgLogoHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  const ogLogoMeta = await sharp(resizedOgLogo).metadata();

  // Create 1200x630 canvas with dark gradient background + subtle gold radial highlight
  const ogBgSvg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="45%" r="65%" fx="50%" fy="45%">
          <stop offset="0%" stop-color="#2a2419" stop-opacity="0.85" />
          <stop offset="60%" stop-color="#0f0f11" stop-opacity="1" />
          <stop offset="100%" stop-color="#09090b" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4af37" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="#27272a" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#d4af37" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)" />
      <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="1.5" />
    </svg>
  `;

  const ogLeft = Math.round((1200 - ogLogoMeta.width) / 2);
  const ogTop = Math.round((630 - ogLogoMeta.height) / 2);

  const ogImageBuffer = await sharp(Buffer.from(ogBgSvg))
    .composite([
      {
        input: resizedOgLogo,
        top: ogTop,
        left: ogLeft,
      },
    ])
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogImageBuffer);
  fs.writeFileSync(path.join(appDir, 'og-image.png'), ogImageBuffer);
  console.log('Generated og-image.png, size:', ogImageBuffer.length, 'bytes');

  // --- 3. Extract Golden "H" Mark for Browser Favicon ---
  // Width 295 isolates the stylized H mark perfectly
  const hCropBuf = await sharp(trimmedLogoBuffer)
    .extract({ left: 0, top: 0, width: 295, height: trimmedMeta.height })
    .trim()
    .toBuffer();

  const iconSize = 512;
  const maxHHeight = 390;

  const resizedH = await sharp(hCropBuf)
    .resize({ height: maxHHeight, fit: 'inside' })
    .toBuffer();
  const rHMeta = await sharp(resizedH).metadata();

  const iconBgSvg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iconGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#231f1a" />
          <stop offset="100%" stop-color="#09090b" />
        </radialGradient>
      </defs>
      <rect width="${iconSize}" height="${iconSize}" rx="112" fill="url(#iconGrad)" />
    </svg>
  `;

  const hLeft = Math.round((iconSize - rHMeta.width) / 2);
  const hTop = Math.round((iconSize - rHMeta.height) / 2);

  const hIconBuffer = await sharp(Buffer.from(iconBgSvg))
    .composite([
      {
        input: resizedH,
        top: hTop,
        left: hLeft,
      },
    ])
    .png()
    .toBuffer();

  // Save icons
  fs.writeFileSync(path.join(publicDir, 'icon.png'), hIconBuffer);
  fs.writeFileSync(path.join(appDir, 'icon.png'), hIconBuffer);

  const appleIconBuffer = await sharp(hIconBuffer)
    .resize(180, 180)
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), appleIconBuffer);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIconBuffer);

  const favicon32Buffer = await sharp(hIconBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32Buffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), favicon32Buffer);

  console.log('All assets generated successfully!');
}

generateAssets().catch(console.error);
