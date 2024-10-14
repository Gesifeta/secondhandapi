const jwt = require('jsonwebtoken')
const connectToDatabase = require('../models/db')
const logger = require('../logger')

// generate token

function generateToken(user) {
    logger.info('generating token')

    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })
}
// verify token
function verifyToken(token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return false
        }

        return decoded
    })

}
// verify if user exists in a database
async function userDoesExist(email) {
    try {
        const db = await connectToDatabase()
        const users = await db.collection('users')
        const doesExist = await users.findOne({ email })
        if (doesExist) return true
        return false
    } catch (error) {
        return error

    }

}
module.exports = {
    verifyToken,
    generateToken,
    userDoesExist
}