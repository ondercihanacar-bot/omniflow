const crypto = require('crypto');
const QRCode = require('qrcode');

// RFC 4648 Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateSecret(length = 20) {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTOTP(secret, timeStep = 30, offset = 0) {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStep) + offset;
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offsetByte = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offsetByte] & 0x7f) << 24) |
    ((hmac[offsetByte + 1] & 0xff) << 16) |
    ((hmac[offsetByte + 2] & 0xff) << 8) |
    (hmac[offsetByte + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

function verifyTOTP(secret, token, window = 1) {
  if (!secret || !token) return false;
  const cleanToken = token.toString().trim();
  for (let error = -window; error <= window; error++) {
    if (generateTOTP(secret, 30, error) === cleanToken) {
      return true;
    }
  }
  return false;
}

async function generateQRCode(otpauthUrl) {
  return await QRCode.toDataURL(otpauthUrl, {
    margin: 1.5,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    },
    width: 220
  });
}

module.exports = {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateQRCode
};
