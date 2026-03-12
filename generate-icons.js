const zlib = require('zlib');
const fs = require('fs');

function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crcVal = crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * (width * 4 + 1) + 1 + x * 4;
      raw[di] = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
      raw[di + 3] = pixels[si + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPixel(pixels, size, x, y, r, g, b, a) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  const sa = a / 255;
  const da = pixels[i + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa === 0) return;
  pixels[i] = Math.round((r * sa + pixels[i] * da * (1 - sa)) / oa);
  pixels[i + 1] = Math.round((g * sa + pixels[i + 1] * da * (1 - sa)) / oa);
  pixels[i + 2] = Math.round((b * sa + pixels[i + 2] * da * (1 - sa)) / oa);
  pixels[i + 3] = Math.round(oa * 255);
}

function distToSeg(ax, ay, bx, by, px, py) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const projX = ax + t * dx, projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  // Background: rounded rectangle with gradient
  const cornerR = size * 0.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = true;
      // Check 4 corners
      if (x < cornerR && y < cornerR) {
        inside = Math.sqrt((x - cornerR) ** 2 + (y - cornerR) ** 2) <= cornerR;
      } else if (x >= size - cornerR && y < cornerR) {
        inside = Math.sqrt((x - (size - cornerR)) ** 2 + (y - cornerR) ** 2) <= cornerR;
      } else if (x < cornerR && y >= size - cornerR) {
        inside = Math.sqrt((x - cornerR) ** 2 + (y - (size - cornerR)) ** 2) <= cornerR;
      } else if (x >= size - cornerR && y >= size - cornerR) {
        inside = Math.sqrt((x - (size - cornerR)) ** 2 + (y - (size - cornerR)) ** 2) <= cornerR;
      }

      if (inside) {
        const t = y / size;
        // Gradient: dark green top -> emerald mid -> dark green bottom
        let r, g, b;
        if (t < 0.4) {
          const lt = t / 0.4;
          r = Math.round(3 + lt * 2);
          g = Math.round(60 + lt * 90);
          b = Math.round(45 + lt * 60);
        } else if (t < 0.6) {
          r = 5; g = 150; b = 105;
        } else {
          const lt = (t - 0.6) / 0.4;
          r = Math.round(5 + lt * 1);
          g = Math.round(150 - lt * 55);
          b = Math.round(105 - lt * 35);
        }
        setPixel(pixels, size, x, y, r, g, b, 255);
      }
    }
  }

  // Shield parameters
  const shieldW = size * 0.55;
  const shieldH = size * 0.6;
  const shieldTop = size * 0.17;

  function isInShield(x, y, padX, padY) {
    const ny = (y - shieldTop - padY) / (shieldH - padY * 2);
    if (ny < 0 || ny > 1) return false;

    let halfW;
    if (ny < 0.5) {
      halfW = (shieldW / 2) - padX;
    } else {
      const t = (ny - 0.5) / 0.5;
      halfW = ((shieldW / 2) - padX) * Math.max(0, 1 - t * t * 1.1);
    }

    if (ny < 0.12) {
      const rt = ny / 0.12;
      halfW *= Math.sqrt(Math.max(0, 1 - (1 - rt) * (1 - rt)));
    }

    return Math.abs(x - cx) <= halfW;
  }

  // Outer shield (white)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isInShield(x, y, 0, 0)) {
        setPixel(pixels, size, x, y, 255, 255, 255, 245);
      }
    }
  }

  // Inner shield (green fill)
  const pad = size * 0.028;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isInShield(x, y, pad, pad)) {
        const ny = (y - shieldTop) / shieldH;
        const r = Math.round(4 + ny * 3);
        const g = Math.round(120 + ny * 30);
        const b = Math.round(85 + ny * 20);
        setPixel(pixels, size, x, y, r, g, b, 255);
      }
    }
  }

  // Checkmark
  const checkCy = shieldTop + shieldH * 0.43;
  const checkScale = size * 0.2;
  const thickness = size * 0.05;

  const p1x = cx - checkScale * 0.52;
  const p1y = checkCy + checkScale * 0.0;
  const p2x = cx - checkScale * 0.05;
  const p2y = checkCy + checkScale * 0.45;
  const p3x = cx + checkScale * 0.6;
  const p3y = checkCy - checkScale * 0.42;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d1 = distToSeg(p1x, p1y, p2x, p2y, x, y);
      const d2 = distToSeg(p2x, p2y, p3x, p3y, x, y);
      const d = Math.min(d1, d2);
      if (d <= thickness + 1.5) {
        const alpha = Math.max(0, Math.min(1, thickness + 1.5 - d));
        setPixel(pixels, size, x, y, 255, 255, 255, Math.round(255 * alpha));
      }
    }
  }

  return createPNG(size, size, pixels);
}

// Generate icons
console.log('Generating icon.png (1024x1024)...');
fs.writeFileSync('assets/icon.png', drawIcon(1024));
console.log('Done.');

console.log('Generating adaptive-icon.png (1024x1024)...');
fs.writeFileSync('assets/adaptive-icon.png', drawIcon(1024));
console.log('Done.');

console.log('Generating favicon.png (48x48)...');
fs.writeFileSync('assets/favicon.png', drawIcon(48));
console.log('Done.');

console.log('Generating splash.png (1284x1284)...');
fs.writeFileSync('assets/splash.png', drawIcon(1284));
console.log('Done.');

console.log('\nAll icons generated successfully!');
