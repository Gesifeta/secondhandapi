/* jshint esversion: 8 */
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')

const cors = require('cors')
const path = require('path')
const pinoLogger = require('./logger')
const serverless=require('serverless-http')

const connectToDatabase = require('./models/db')

const app = express()

//const port = process.env.PORT || 3000
//  Connect to MongoDB we just do this one time

connectToDatabase().then(() => {
  pinoLogger.info('Connected to DB')
})
  .catch((e) => console.error('Failed to connect to DB', e))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
const userRoutes = require('./routes/userRoutes')

const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes')
const searchRoutes = require('./routes/searchRoutes')

const pinoHttp = require('pino-http')
const logger = require('./logger')
// CORS configuration
const corsOptions = {
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use("*",cors(corsOptions));
app.use('/.netlify/functions/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(pinoHttp({ logger }))
app.use('/images',express.static(path.join(__dirname, 'public','images')))
app.use('/.netlify/functions/api', userRoutes)
app.use('/.netlify/functions/api', secondChanceItemsRoutes)
app.use('/.netlify/functions/api', searchRoutes)
app.get('/.netlify/functions/api', (req, res) => {
  res.send(`
    
    <h1>Second Chance API</h1>
    <p>Welcome to the Second Chance API!</p>
  <br>
  <p>Here are the available routes:</p>
  <ul>
    <li><a href="/api/secondchance/search">Search all items</a></li>
    <li><a href="/api/secondChanceitems/items">/api/secondChanceItems</a></li>
    <li><a href="/api/auth">Users</a></li>
  </ul>
  <br>
  <p>For more information, please refer to the README.md file.</p>
  <br>
  <p>Thank you for using Second Chance API!</p>
  <br>
  <p>Best regards,</p>
  <p>The Second Chance Team</p>
  <br>
  <p>PS: This is a demo project, so please do not use this in production.</p>
  <br>
  <p>© 2024 Second Chance. All rights reserved.</p>
  <br>
  <p>For more information, please refer to the LICENSE file.</p>
  <br>

    `)
})  
app.use((error, req, res, next) => {
  res.status(500)
  res.send({error: error})
  console.error(error.stack)
  next(error)
})
loadData()
// app.listen(port, () => {
//   console.log(`Server is running on PORT ${port}`)
// })
module.exports.handler=serverless(app)
