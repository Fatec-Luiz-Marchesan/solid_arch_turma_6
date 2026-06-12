const app = require('./src/external/frameworks/app')

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log('Servidor rodando na porta ${PORT}')
    })
}

module.exports = app