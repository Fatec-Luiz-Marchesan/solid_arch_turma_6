/**
 * Configuração do Jest isolada em arquivo próprio (em vez da chave "jest"
 * dentro do package.json). Mais explícita e evita ambiguidade de path
 * resolution entre diferentes runners/versões do Jest.
 * Pois quando rodava estava deixando tudo confuso!
 */

module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'models/Report.js',
    'usecases/*.js',
    'controllers/ReportController.js',
    'routers/ReportRouters.js',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}
