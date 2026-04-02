const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const users = [
    {
        name: 'Prakul Recruiter',
        email: 'prakul5555@gmail.com',
        password: 'Prakul123',
        role: 'recruiter'
    },
    {
        name: 'Ansh Candidate',
        email: 'ansh@example.com',
        password: 'Prakul123',
        role: 'candidate'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');
        
        // Remove existing test users if they exist
        await User.deleteMany({ email: { $in: users.map(u => u.email) } });
        
        // Use User.create so passwords get hashed by the pre-save hook
        for (const user of users) {
             await User.create(user);
             console.log(`User seeded: ${user.email}`);
        }
        
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
