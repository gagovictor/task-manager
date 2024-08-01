const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async ({ username, password, email }) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });
        return { id: user.id, username: user.username }; // Return user data excluding sensitive information
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error('Registration failed');
    }
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    console.log('User from database:', user);
    console.log('Password provided:', password);
    console.log('Hashed password in DB:', user ? user.password : 'No user found');
    
    if (!user || !await bcrypt.compare(password, user.password)) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};
