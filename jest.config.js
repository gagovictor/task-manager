module.exports = {
    setupFiles: ['dotenv/config'],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
