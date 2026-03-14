const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'prakul03@gmail.com' });
        if (user) {
            console.log('User found:', user.email, 'Role:', user.role);
        } else {
            console.log('User NOT found: prakul03@gmail.com');
            // List some users to see what's there
            const users = await User.find().limit(5);
            console.log('Existing users in DB:', users.map(u => u.email));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
