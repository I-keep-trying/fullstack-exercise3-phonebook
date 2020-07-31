const express = require('express')
const app = express()

app.use(express.json())

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  const date = new Date()
  res.send(
    `<h1>Phonebook has info for ${persons.length} people </h1> <br /> <h3> ${date}</h3> `
  )
  console.log('people?', persons.length)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// I found (thanks to stackoverflow) a way to guarantee no duplicate id's are created.
const generateId = () => {
  let randoms = []
  while (randoms.length < persons.length + 1) {
    let id = Math.ceil(1 + Math.floor(Math.random() * 100))
    if (randoms.indexOf(id) == -1) {
      randoms.push(id)
      return id
    }
  }
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  if (
    persons.find(
      person => person.name.toLowerCase() === body.name.toLowerCase()
    )
  ) {
    return response.status(401).json({
      error: 'duplicate exists',
    })
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = 3008
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
