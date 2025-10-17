module.exports = {
    verbose: true,
    testMatch: ['**/__tests__/unit/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
    moduleNameMapper: {
        axios: 'axios/dist/node/axios.cjs',
    },
    // No globalSetup - unit tests don't need database
    setupFilesAfterEnv: ['./src/test/jest.unit.setup.js'],
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
