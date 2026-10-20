const { encryptString, decryptString } = require('./envelopeEncryption');

/**
 * Mongoose plugin to automatically apply Envelope Encryption to specified paths.
 */
function mongooseEncryptionPlugin(schema, options) {
    const encryptedFields = options.fields || [];

    // Helper functions
    const encryptDoc = function (doc) {
        encryptedFields.forEach(field => {
            const val = doc.get(field);
            if (val && typeof val === 'string') {
                doc.set(field, encryptString(val));
            }
        });
    };

    const decryptDoc = function (doc) {
        if (!doc) return;
        encryptedFields.forEach(field => {
            const val = doc.get(field);
            if (val && typeof val === 'string') {
                doc.set(field, decryptString(val));
            }
        });
    };

    // --- PRE HOOKS (Encryption before saving) ---

    // Intercept document.save()
    schema.pre('save', function () {
        encryptDoc(this);
    });

    // Intercept Model.insertMany()
    schema.pre('insertMany', function (next, docs) {
        const documents = Array.isArray(docs) ? docs : (Array.isArray(next) ? next : []);
        documents.forEach(doc => encryptDoc(doc));
        if (typeof next === 'function') next();
    });

    // Intercept updates (findOneAndUpdate, updateOne, updateMany)
    const updateHooks = ['findOneAndUpdate', 'updateOne', 'updateMany'];
    updateHooks.forEach(hook => {
        schema.pre(hook, function () {
            const update = this.getUpdate();
            if (!update) return;

            // Handle standard $set operations
            if (update.$set) {
                encryptedFields.forEach(field => {
                    if (update.$set[field] && typeof update.$set[field] === 'string') {
                        update.$set[field] = encryptString(update.$set[field]);
                    }
                });
            }

            // Handle direct set operations (less common but possible)
            encryptedFields.forEach(field => {
                if (update[field] && typeof update[field] === 'string') {
                    update[field] = encryptString(update[field]);
                }
            });

            this.setUpdate(update);
        });
    });

    // --- POST HOOKS (Decryption after retrieving or saving) ---

    // Single document getters & savers
    const singleReadHooks = ['findOne', 'findById', 'findOneAndUpdate', 'save'];
    singleReadHooks.forEach(hook => {
        schema.post(hook, function (doc) {
            decryptDoc(doc);
        });
    });

    // Multiple document getters & savers
    const multiReadHooks = ['find', 'insertMany'];
    multiReadHooks.forEach(hook => {
        schema.post(hook, function (docs) {
            if (Array.isArray(docs)) {
                docs.forEach(doc => decryptDoc(doc));
            }
        });
    });

    // Support for lean() queries (optional but good practice)
    /* Note: if users use .lean(), Mongoose returns POJOs, not Mongoose Documents,
       so doc.get/doc.set won't work perfectly in all cases without extra logic. 
       We will manually handle lean docs if necessary, but this covers 99% of ORM usage. */
}

module.exports = mongooseEncryptionPlugin;
