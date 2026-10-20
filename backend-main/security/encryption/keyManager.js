const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-gcm';

// Fetch Master Key from environment variables and ensure it is 32 bytes
let rawMasterKey = process.env.MASTER_KEY || 'default_32_byte_master_key_for_dev_ONLY!!';
if (rawMasterKey.length < 32) {
    rawMasterKey = rawMasterKey.padEnd(32, '0');
} else if (rawMasterKey.length > 32) {
    rawMasterKey = rawMasterKey.substring(0, 32);
}
const MASTER_KEY = Buffer.from(rawMasterKey, 'utf8');

/**
 * Generates a new random 256-bit (32 bytes) Data Encryption Key (DEK).
 */
function generateDEK() {
    return crypto.randomBytes(32);
}

/**
 * Encrypts the provided DEK using the Master Key (KEK).
 * Returns the encrypted DEK, IV, and Auth Tag encoded as Base64 strings.
 */
function encryptDEK(dekBuffer) {
    const iv = crypto.randomBytes(12); // Standard GCM IV size
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

    let encryptedDek = cipher.update(dekBuffer, null, 'base64');
    encryptedDek += cipher.final('base64');

    const authTag = cipher.getAuthTag().toString('base64');

    return {
        encryptedDek,
        iv: iv.toString('base64'),
        authTag
    };
}

/**
 * Decrypts an encrypted DEK using the Master Key (KEK).
 */
function decryptDEK(encryptedDekBase64, ivBase64, authTagBase64) {
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);

    let decryptedDek = decipher.update(encryptedDekBase64, 'base64');
    decryptedDek = Buffer.concat([decryptedDek, decipher.final()]);

    return decryptedDek;
}

module.exports = {
    generateDEK,
    encryptDEK,
    decryptDEK
};
