const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const u = await User.findOne({ email: /test_register_2/ });

    const updatedUser = await User.findByIdAndUpdate(
        u._id,
        { $set: { phone: '999-999-9999' } },
        { new: true }
    );

    console.log('Update Returned Phone:', updatedUser.phone);
    console.log('Update Returned Name:', updatedUser.name);

    await mongoose.disconnect();
}
test();
