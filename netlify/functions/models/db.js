//  db.js
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

const url = `mongodb://${process.env.MONGO_DB_INIT_ROOT_USER}:${process.env.MONGO_DB_INIT_ROOT_PASSWORD}@${process.env.MONGO_DB_LOCAL_HOST}`
let dbInstance = null
const dbName = `secondChance`

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance
    }

    const client = new MongoClient(url)

    //  Task 1: Connect to MongoDB
    await client.connect()

    //  Task 2: Connect to database giftDB and store in variable dbInstance
    dbInstance = client.db(dbName)

    //  Task 3: Return database instance
    return dbInstance
}
module.exports = connectToDatabase
