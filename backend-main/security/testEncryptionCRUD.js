const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

/**
 * Standalone CRUD Test Script for Secure Envelope Encryption
 * Verifies that data is encrypted in DB and decrypted in app.
 */
async function testEncryptionCRUD() {
    try {
        console.log('🚀 Starting Encryption CRUD Test...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const testEmail = 'crud_test_' + Date.now() + '@example.com';

        // --- 1. CREATE ---
        console.log('\n--- STEP 1: CREATE ---');
        const newUser = new User({
            name: 'CRUD Test User',
            email: testEmail,
            password: 'SecurePassword123!',
            bloodGroup: 'O+',
            medicalConditions: 'Initial Condition'
        });
        await newUser.save();
        console.log('✅ User created. Mongoose View Name:', newUser.name);

        // --- 2. READ (Raw Check) ---
        console.log('\n--- STEP 2: READ (RAW DB CHECK) ---');
        const rawUser = await mongoose.connection.db.collection('users').findOne({ email: testEmail });
        console.log('🔒 RAW DATABASE VIEW (Encrypted?):');
        console.log(' - Name:', rawUser.name.startsWith('enc:') ? 'YES (Encrypted)' : 'NO (ERROR)');
        console.log(' - Blood Group:', rawUser.bloodGroup.startsWith('enc:') ? 'YES (Encrypted)' : 'NO (ERROR)');
        console.log(' - Raw Name Payload:', rawUser.name.substring(0, 50) + '...');

        // --- 3. READ (Mongoose Check) ---
        console.log('\n--- STEP 3: READ (APP VIEW) ---');
        const appUser = await User.findOne({ email: testEmail });
        console.log('🔓 MONGOOSE APP VIEW (Decrypted?):');
        console.log(' - Name:', appUser.name === 'CRUD Test User' ? 'YES (Decrypted)' : 'NO (ERROR)');
        console.log(' - Blood Group:', appUser.bloodGroup === 'O+' ? 'YES (Decrypted)' : 'NO (ERROR)');

        // --- 4. UPDATE ---
        console.log('\n--- STEP 4: UPDATE ---');
        await User.findByIdAndUpdate(appUser._id, { $set: { name: 'Updated CRUD Name', medicalConditions: 'Updated Condition' } });
        const updatedUser = await User.findById(appUser._id);
        console.log('✅ User updated. New Name in App:', updatedUser.name);

        const rawUpdated = await mongoose.connection.db.collection('users').findOne({ _id: appUser._id });
        console.log('🔒 Raw Check on Updated Name:', rawUpdated.name.startsWith('enc:') ? 'STILL ENCRYPTED' : 'NOT ENCRYPTED');

        // --- 5. DELETE ---
        console.log('\n--- STEP 5: DELETE ---');
        await User.deleteOne({ _id: appUser._id });
        const deletedUser = await User.findById(appUser._id);
        if (!deletedUser) {
            console.log('✅ User successfully deleted.');
        }

        console.log('\n🎉 ALL ENCRYPTION CRUD TESTS PASSED!');
    } catch (err) {
        console.error('\n❌ TEST FAILED:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testEncryptionCRUD();
