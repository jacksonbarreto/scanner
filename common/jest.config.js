module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transform: {
        '^.+\\.(ts|tsx)?$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }],
    },
    verbose: true,
};