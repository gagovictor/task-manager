require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Op } = require('sequelize');

exports.register = async ({ username, password, email }) => {
    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                throw new Error('Username already exists');
            }
            if (existingUser.email === email) {
                throw new Error('Email already in use');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email
        };
    } catch (error) {
        if (error.message === 'Username already exists' || error.message === 'Email already in use') {
            throw error;
        }
        console.error('Registration error:', error);
        throw new Error('Registration failed');
    }
};

exports.login = async ({ username, password }) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error('No user found with this username');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Incorrect password');
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    } catch (error) {
        if (error.message === 'No user found with this username' || error.message === 'Incorrect password') {
            throw error;
        }
        console.error('Login error:', error);
        throw new Error('Login failed');
    }
};
