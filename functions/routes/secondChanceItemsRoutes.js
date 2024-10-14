const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const connectToDatabase = require('../models/db')
const logger = require('../logger')

//  Define the upload directory path
const directoryPath = 'public/images'

//  Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, directoryPath) //  Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //  Use the original file name
    },
})

const upload = multer({ storage: storage })

//  Get all secondChanceItems
router.get('/secondchance/items', async (req, res, next) => {
    try {
        // Step 2: task 1 - insert code here
        const db = await connectToDatabase()
        // Step 2: task 2 - insert code here
        const collection = await db.collection('secondChanceItems')
        // Step 2: task 3 - insert code here
        const secondChanceItems = await collection.find({}).toArray()
        // Step 2: task 4 - insert code here
        res.json(secondChanceItems)
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e)
    }
})

//  Add a new item
router.post('/secondchance/items', upload.single('file'), async (req, res, next) => {
    try {
        const newItem = req.body
        // Step 3: task 1 - insert code here
        const db = await connectToDatabase()
        // Step 3: task 2 - insert code here
        const collection = await db.collection('secondChanceItems')
        // Step 3: task 3 - insert code here
        // find the last id
        const lastItem = await collection.find({}).sort({ id: -1 }).limit(1).toArray()
        //  Add file information if a file was uploaded
        if (req.file) {
            newItem.imageUrl = `/images/${req.file.filename}`
        }

        await lastItem.forEach(item => { newItem.id = (parseInt(item.id) + 1).toString() })
        const date_added = Math.floor(new Date().getTime() / 1000)
        newItem.date_added = date_added
        const secondChanceItem = await collection.insertOne(newItem)
        // Step 3: task 4 - insert code here
        // Step 3: task 5 - insert code here
        res.status(201).json(secondChanceItem)
    } catch (e) {
        next(e)
    }
})

//  Get a single secondChanceItem by ID
router.get('/secondchance/items/:id', async (req, res, next) => {
    try {

        // Step 4: task 1 - insert code here
        const db = await connectToDatabase()
        // Step 4: task 2 - insert code here
        const collection = await db.collection('secondChanceItems')
        // Step 4: task 3 - insert code here
        const secondChanceItem = await collection.findOne({ id: req.params.id })
        // Step 4: task 4 - insert code here
        if (!secondChanceItem) {
            return res.status(404).json({ message: 'secondChanceItem not found' })
        }
        res.json(secondChanceItem)
    } catch (e) {
        next(e)
    }
})

//  Update and existing item
router.put('/secondchance/items/:id', async (req, res, next) => {
    try {
        /*    Update the item's attributes as follows
           category
           condition
           age_days
           description
           age_years (Calculated to one decimal place from age_days)
           updatedAt (Calculated from the current date)
   */
        const db = await connectToDatabase()

        const collection = await db.collection('secondChanceItems')
        const secondChanceItem = await collection.findOne({ id: req.params.id })
        if (!secondChanceItem) {
            return res.status(404).json({ message: 'secondChanceItem not found' })
        }
        secondChanceItem.category = req.body.category
        secondChanceItem.condition = req.body.condition
        secondChanceItem.age_days = req.body.age_days
        const age_years = parseFloat((secondChanceItem.age_days / 365).toFixed(1))
        secondChanceItem.age_years = age_years
        secondChanceItem.description = req.body.description
        const date_added = Math.floor(new Date().getTime() / 1000)
        secondChanceItem.updatedAt = date_added
        const updatedsecondChanceItem = await collection.findOneAndUpdate({ id: req.params.id }, { $set: secondChanceItem })
        if (updatedsecondChanceItem) {
            res.json({ 'uploaded': 'success' })
        } else {
            res.json({ 'uploaded': 'failed' })
        }
    } catch (e) {
        next(e)
    }
})

//  Delete an existing item
router.delete('/secondchance/items/:id', async (req, res, next) => {
    try {

        const db = await connectToDatabase()
        const collection = await db.collection('secondChanceItems')
        const secondChanceItem = await collection.findOne({ id: req.params.id })
        if (!secondChanceItem) {
            return res.status(404).json({ message: 'secondChanceItem not found' })
        }
        const deletedsecondChanceItem = await collection.deleteOne({ id: req.params.id })
        if (deletedsecondChanceItem.deletedCount === 1) {
            res.json({ 'deleted': 'success' })
        } else {
            res.json({ 'deleted': 'failed' })
        }
    } catch (e) {
        next(e)
    }
})

module.exports = router
