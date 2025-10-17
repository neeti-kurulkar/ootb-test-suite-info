module.exports = {
    verbose: true,
    testMatch: ['**/__tests__/integration/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
    moduleNameMapper: {
        axios: 'axios/dist/node/axios.cjs',
    },
    // Integration tests need database setup
    globalSetup: './src/test/global.setup.js',
    setupFilesAfterEnv: ['./src/test/jest.setup.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/test/**',
        '!src/**/*.test.js',
        '!src/bin/**',
        '!src/config/**',
        '!src/migrations/**',
        '!src/seeders/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
};
