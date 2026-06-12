/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom:[
        'src/**/*.js', 'controllers/**/*.js', 'models/**/*.js',
        'helpers/**/*.js', '!src/**/__tests__/**', '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'text-summary', 'lcov'],
    coverageThreshold:{
        global: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    projects:[
        {
            displayName: 'unit',
            testEnvironment: 'node',
            testMatch:[
                '<rootDir>/src/__tests__/**/*.spec.js',
                '<rootDir>/src/domain/**/*.spec.js',
                '<rootDir>/src/use-cases/**/*.spec.js',
                '<rootDir>/src/adapters/security/**/*.spec.js',
                '<rootDir>/src/adapters/validators/**/*.spec.js'
            ],
            clearMocks: true,
        },
        {
            displayName: 'integration',
            testEnvironment: 'node',
            testMatch:[
                '<rootDir>/src/adapters/controllers/**/*.spec.js',
                '<rootDir>/src/external/**/*.spec.js'
            ],
            setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
            testTimeout: 30000,
            clearMocks: true,
        },
    ],
}