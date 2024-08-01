const userService = require('../services/userService');

exports.register = async (req, res) => {
    try {
        const user = await userService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const token = await userService.login(req.body);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
};
