const express = require('express')
const connectDB = require('./config/db')
const app = express()
const cors = require('cors')

// Load config env
require('dotenv').config()

// Connect Database
connectDB(process.env.MONGO_URI)

app.use(cors())

// Init Middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) =>
  res.json({
    api_path: '/api/users',
    port: 5000,
  })
)

// Define API Routes
// Imports all of the routes from ./routes/index.js
app.use(require('./routes'))

// If there is no env port then use port 5000
const PORT = process.env.PORT || 5000

app.listen(PORT, () =>
  console.log(`${process.env.NODE_ENV} server started on PORT ${PORT}`)
)
