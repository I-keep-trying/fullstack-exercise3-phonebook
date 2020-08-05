require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/people')
const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('person', request => {
  return JSON.stringify(request.body)
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :person'
  )
)

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/info', (req, res) => {
  Person.find({}).then(persons => {
    const count = persons.length
    const date = new Date()
    res.send(
      `<div>
        <div>Phonebook has info for ${count} people</div>
        <div>${date}</div>
      </div>`
    )
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// I found (thanks to stackoverflow) a way to guarantee no duplicate id's are created.
/* const generateId = () => {
  let randoms = []
  while (randoms.length < persons.length + 1) {
    let id = Math.ceil(1 + Math.floor(Math.random() * 100))
    if (randoms.indexOf(id) == -1) {
      randoms.push(id)
      return id
    }
  }
} */

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      response.send( error)})
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', async (request, response) => {
  await Person.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
