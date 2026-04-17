const js = require('@eslint/js');

const sharedGlobals = {
    CONFIG: 'readonly',
    supabase: 'readonly',
    Lenis: 'readonly',
    React: 'readonly',
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    location: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    fetch: 'readonly',
    Blob: 'readonly',
    CustomEvent: 'readonly',
    Event: 'readonly',
    FileReader: 'readonly',
    FormData: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    AbortController: 'readonly',
    IntersectionObserver: 'readonly',
    XMLHttpRequest: 'readonly',
    performance: 'readonly',
    alert: 'readonly',
    requestAnimationFrame: 'readonly',
    cancelAnimationFrame: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    console: 'readonly',
};

const testGlobals = {
    jest: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
};

module.exports = [
    {
        ignores: [
            '**/node_modules/**',
            '**/node_modules_old/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'playwright-report/**',
            'test-results/**',
            '**/*.min.js',
            '**/*.min.css',
        ],
    },
    js.configs.recommended,
    {
        files: ['frontend/**/*.js', 'tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...sharedGlobals,
                ...testGlobals,
            },
        },
        rules: {
            indent: ['error', 2],
            'linebreak-style': 'off',
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'warn',
            'no-var': 'error',
        },
    },
    {
        files: ['frontend/translations.js'],
        rules: {
            indent: 'off',
            quotes: 'off',
        },
    },
];