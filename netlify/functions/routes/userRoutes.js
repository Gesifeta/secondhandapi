const express = require('express')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')

const connectToDatabase = require('../models/db')
const { userDoesExist, generateToken, verifyToken } = require('../auth/authRoutes')
const logger = require('../logger')
const router = express.Router()

router.post('/auth/register', async (req, res) => {
    try {
        let user = {}
        if (req.body) {
            user.firstName = req.body.firstName
            user.lastName = req.body.lastName
            user.email = req.body.email
            user.createdAt = new Date()
        }
        else {
            return res.status(401).json({ message: 'All fields are required' })
        }

        //  Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase()
        //  Task 2: Access MongoDB `users` collection
        const users = await db.collection('users')
        //  Task 3: Check if user credentials already exists in the database and throw an error if they do
        const userExists = await userDoesExist(req.body.email)

        if (userExists) return res.status(401).json({ message: 'User already Exists.' })
        //  Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        user.password = hashedPassword
        //  Task 5: Insert the user into the database
        const newUser = await users.insertOne(user)

        //  Task 6: Create JWT authentication if passwords match with user._id as payload
        const authtoken = generateToken({
            user: {
                id: newUser.insertedId.toString()
            }
        })

        //  Task 7: Log the successful registration using the logger
        logger.info('User registered successfully')

        //  Task 8: Return the user email and the token as a JSON
        return res.status(401).json({ authtoken, email: req.body.email })
    } catch (e) {
        return res.status(500).send('Internal server error')
    }
})
router.post('/auth/login', async (req, res) => {
    try {
        //  Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase()
        //  Task 2: Access MongoDB `users` collection
        const users = await db.collection('users')
        //  Task 3: Check for user credentials in database
        const user = await users.findOne({ email: req.body.email })
        if (!user) return res.status(404).json({ message: 'User not found' })
        //  Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'User name or password does not match' })
        //  Task 5: Fetch user details from a database
        const userName = user.firstName
        const userEmail = user.email
        //  Task 6: Create JWT authentication if passwords match with user._id as payload
        const authtoken = generateToken({
            user: {
                id: user._id.toString()
            }
        })

        res.json({ authtoken, userName, userEmail })
        //  Task 7: Send appropriate message if the user is not found
    } catch (e) {
        return res.status(500).send('Internal server error')

    }
})
// update user
router.put('/auth/update', [
    body('email', 'email is required').isEmail(),
    body('firstName', 'firstName is required').isLength({ min: 3 }),
], async (req, res) => {
    const errors = validationResult(req)
    const { email } = req.headers
    console.log('header email=== >', email)
    const { firstName } = req.body
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array())
        return res.status(400).json({ errors: errors.array() })
    }
    const db = await connectToDatabase()
    const users = await db.collection('users')
    if (!email) {
        logger.error('Email not found in the request headers')
        return res.status(403).json({ message: 'Email not found in the request headers' })
    }
    if (email !== req.body.email) return res.status(403).json({ message: 'You are not , Email cannot be changed' })
    const existingUser = await users.findOne({ email })
    if (!existingUser) return res.status(404).json({ message: 'User not found' })

    const updatedUser = await users.updateOne({ email }, {
        $set: { firstName }
    })
    if (updatedUser.modifiedCount === 0) return res.status(404).json({ message: 'User not found' }
        , logger.info('User updated successfully')
    )
    // create token
    const authToken = generateToken({
        user: {
            id: existingUser._id.toString()
        }
    })
    return res.json({ authToken, email: req.body.email })

})
module.exports = router