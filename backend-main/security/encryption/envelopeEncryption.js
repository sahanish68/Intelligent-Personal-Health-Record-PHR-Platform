const crypto = require('crypto');
const { generateDEK, encryptDEK, decryptDEK } = require('./keyManager');

const ALGORITHM = 'aes-256-gcm';
const ENC_PREFIX = 'enc:';

/**
 * Encrypts a plaintext string using Secure Envelope Encryption.
 * @param {string} plaintext - The string to encrypt.
 * @returns {string} The fully serialized encrypted string (enc:encryptedDek:kekIv:kekAuthTag:encryptedPayload:payloadIv:payloadAuthTag).
 */
function encryptString(plaintext) {
    if (typeof plaintext !== 'string') return plaintext;
    if (!plaintext) return plaintext;

    // Safety check: Don't double encrypt
    if (plaintext.startsWith(ENC_PREFIX)) return plaintext;

    // 1. Generate unique DEK for this specific field/record
    const dek = generateDEK();

    // 2. Encrypt DEK with Master Key
    const { encryptedDek, iv: kekIv, authTag: kekAuthTag } = encryptDEK(dek);

    // 3. Encrypt payload with DEK
    const payloadIv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, dek, payloadIv);

    let encryptedPayload = cipher.update(plaintext, 'utf8', 'base64');
    encryptedPayload += cipher.final('base64');

    const payloadAuthTag = cipher.getAuthTag().toString('base64');

    // 4. Combine all components into a single storage string
    // Format: enc:encryptedDek:kekIv:kekAuthTag:encryptedPayload:payloadIv:payloadAuthTag
    return `${ENC_PREFIX}${encryptedDek}:${kekIv}:${kekAuthTag}:${encryptedPayload}:${payloadIv.toString('base64')}:${payloadAuthTag}`;
}

/**
 * Decrypts a secure envelope encrypted string.
 * @param {string} ciphertext - The serialized encrypted string.
 * @returns {string} The decrypted plaintext (or the original string if it wasn't encrypted).
 */
function decryptString(ciphertext) {
    if (typeof ciphertext !== 'string') return ciphertext;

    // Backward compatibility: If it doesn't start with 'enc:', it's old plaintext data
    if (!ciphertext.startsWith(ENC_PREFIX)) return ciphertext;

    try {
        const parts = ciphertext.substring(ENC_PREFIX.length).split(':');

        // Ensure we have all 6 pieces of data
        if (parts.length !== 6) {
            console.error("Envelope format corrupted");
            return ciphertext; // Safe fallback
        }

        const [encryptedDek, kekIv, kekAuthTag, encryptedPayload, payloadIvBase64, payloadAuthTagBase64] = parts;

        // 1. Decrypt DEK using Master Key
        const dek = decryptDEK(encryptedDek, kekIv, kekAuthTag);

        // 2. Decrypt payload using DEK
        const payloadIv = Buffer.from(payloadIvBase64, 'base64');
        const payloadAuthTag = Buffer.from(payloadAuthTagBase64, 'base64');

        const decipher = crypto.createDecipheriv(ALGORITHM, dek, payloadIv);
        decipher.setAuthTag(payloadAuthTag);

        let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf8');
        decryptedPayload += decipher.final('utf8');

        return decryptedPayload;
    } catch (error) {
        console.error("Decryption failed:", error.message);
        return ciphertext; // Fallback to raw value on failure to avoid completely breaking the app
    }
}

module.exports = {
    encryptString,
    decryptString,
    ENC_PREFIX
};
