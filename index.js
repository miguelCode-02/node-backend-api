const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
require('dotenv').config()
require('./mongo')
const express = require('express')
const logger = require('./middleware/loggerMiddleware')
const cors = require('cors')
const Note = require('./models/Note')
const handlerError = require('./middleware/handlerError')
const notFound = require('./middleware/notFound')

// const http = require('http');

const app = express()

app.use(cors())

app.use(express.json())

app.use(logger)

// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type' : 'application/json'})
//     response.end(JSON.stringify(notes))
// })

Sentry.init({
  dsn: 'https://294900155eda42d3b4fb23861322a44d@o4504584424128512.ingest.sentry.io/4504584456830976',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app })
  ],

  tracesSampleRate: 1.0
})

app.get('/', (request, response) => {
  response.send('<h1>Hello world</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  }).catch(err => {
    response.status(500).json({ error: err })
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById({ _id: request.params.id })
    .then(ress => {
      if (ress) {
        response.json(ress)
      } else {
        response.status(404).end()
      }
    }).catch(err => {
      next(err)
    })
})

app.put('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  const { content, date, important } = request.body

  const newSchemaNote = {
    content,
    important,
    date
  }

  Note.findByIdAndUpdate(id, newSchemaNote, { new: true })
    .then(ress => response.json(ress))
    .catch(err => next(err))
})

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndDelete(id).then(ress => {
    response.status(204).end()
  }).catch(err => next(err))
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: typeof note.important !== 'undefined' ? note.important : false
  })

  newNote.save().then(saveNote => {
    response.status(201).json(saveNote)
  }).catch(err => {
    response.status(500).json({ error: err })
  })
})

app.use(notFound)

app.use(Sentry.Handlers.errorHandler())

app.use(handlerError)

const PORT = process.env.port
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
