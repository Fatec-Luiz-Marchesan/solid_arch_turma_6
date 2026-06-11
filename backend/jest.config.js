/**@type {import('jest').config} */
const config = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.js'],
    collectCoverage: true,
    collectCoverageFrom: [
        'controllers/**/*.js',
        'helpers/**/*.js',
        'models/**/*.js',
        'usecases/**/*.js',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
};

module.exports = config;