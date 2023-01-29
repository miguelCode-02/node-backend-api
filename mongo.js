const mongoose = require('mongoose')

const connectionString = process.env.MONGO_DB_URI

// conexion a mongoDB

mongoose.set('strictQuery', true)

mongoose.connect(connectionString).then(() => {
  console.log('Conectado a base de datos')
}).catch(err => {
  console.error('fallo: ' + err)
})

process.on('uncaughtException', () => {
  mongoose.connection.disconnect()
  console.log('Desconectado de mongoDB')
})
