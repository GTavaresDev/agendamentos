const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIcoFromPngBuffer(pngBuffer, width = 32, height = 32) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Image type: 1 = ICO
  header.writeUInt16LE(1, 4); // Number of images: 1

  // Directory entry: 16 bytes
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width >= 256 ? 0 : width, 0);
  dirEntry.writeUInt8(height >= 256 ? 0 : height, 1);
  dirEntry.writeUInt8(0, 2); // Color palette
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  dirEntry.writeUInt32LE(22, 12); // Offset of image data (6 + 16)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

async function generateAssets() {
  const publicDir = path.join(__dirname, '../public');
  const appDir = path.join(__dirname, '../src/app');

  // --- 1. Vector Icon SVG ---
  const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#09090b" />
  <g transform="translate(106, 106)">
    <rect width="300" height="300" rx="60" fill="#18181b" stroke="#27272a" stroke-width="6" />
    <rect x="65" y="65" width="170" height="170" rx="32" fill="none" stroke="#ffffff" stroke-width="14" />
    <line x1="65" y1="120" x2="235" y2="120" stroke="#ffffff" stroke-width="14" />
    <circle cx="115" cy="165" r="14" fill="#10b981" />
    <circle cx="185" cy="165" r="14" fill="#ffffff" />
    <circle cx="115" cy="205" r="14" fill="#ffffff" />
    <circle cx="185" cy="205" r="14" fill="#10b981" />
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), iconSvg);
  console.log('Generated icon.svg');

  // --- 2. Generate OG Image (1200 x 630) for Agendamentos ---
  const ogBgSvg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b" />
          <stop offset="50%" stop-color="#09090b" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      
      <!-- Decorative Grid -->
      <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
        <path d="M0 105H1200 M0 210H1200 M0 315H1200 M0 420H1200 M0 525H1200" />
        <path d="M200 0V630 M400 0V630 M600 0V630 M800 0V630 M1000 0V630" />
      </g>

      <!-- Calendar Emblem Icon -->
      <g transform="translate(180, 240)">
        <rect width="140" height="140" rx="28" fill="#18181b" stroke="#27272a" stroke-width="3" />
        <rect x="30" y="30" width="80" height="80" rx="16" fill="none" stroke="#ffffff" stroke-width="7" />
        <line x1="30" y1="56" x2="110" y2="56" stroke="#ffffff" stroke-width="7" />
        <circle cx="55" cy="78" r="6" fill="#10b981" />
        <circle cx="85" cy="78" r="6" fill="#ffffff" />
        <circle cx="55" cy="98" r="6" fill="#ffffff" />
        <circle cx="85" cy="98" r="6" fill="#10b981" />
      </g>

      <!-- Text -->
      <text x="360" y="300" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="64" fill="#ffffff" letter-spacing="-1">Agendamentos</text>
      <text x="360" y="355" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="28" fill="#a1a1aa" letter-spacing="2">GESTÃO INTELIGENTE &amp; AGENDA</text>
    </svg>
  `;

  const ogImageBuffer = await sharp(Buffer.from(ogBgSvg))
    .png({ quality: 90 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogImageBuffer);
  fs.writeFileSync(path.join(appDir, 'og-image.png'), ogImageBuffer);
  console.log('Generated og-image.png');

  // --- 3. PNG Icons (512, 192, 180) ---
  const iconBuffer512 = await sharp(Buffer.from(iconSvg)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon.png'), iconBuffer512);
  fs.writeFileSync(path.join(appDir, 'icon.png'), iconBuffer512);

  const iconBuffer192 = await sharp(iconBuffer512).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'agendamentos_icon.png'), iconBuffer192);
  fs.writeFileSync(path.join(appDir, 'agendamentos_icon.png'), iconBuffer192);

  const appleIconBuffer = await sharp(iconBuffer512).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), appleIconBuffer);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIconBuffer);

  // --- 4. Valid ICO Favicon (32x32 with ICO container header) ---
  const favicon32Png = await sharp(iconBuffer512).resize(32, 32).png().toBuffer();
  const faviconIcoBuffer = createIcoFromPngBuffer(favicon32Png, 32, 32);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconIcoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), faviconIcoBuffer);
  console.log('Generated valid favicon.ico');

  console.log('All Agendamentos branding assets generated successfully!');
}

generateAssets().catch(console.error);

