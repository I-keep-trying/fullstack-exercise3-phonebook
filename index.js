require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/people')

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

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
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

app.post('/api/persons', (request, response) => {
  const body = request.body
console.log('post body', body)
  if (body.name === undefined || body.number === undefined || body.name.length === 0 || body.number.length === 0) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.delete('/api/persons/:id', async (request, response) => {
  console.log('delete person', request.params)
  await Person.findByIdAndRemove(request.params.id)
  response.status(204).end()

})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
