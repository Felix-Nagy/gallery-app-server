const express = require('express')
const Image = require('../models/images')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const upload = require('../utils/upload')
const router = new express.Router()


router.post('/images', upload.single('data'), auth, async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    const image = new Image({
        ...req.body,
        owner: req.user._id
    })
    image.data = buffer
    try {
        await image.save()
        res.status(201).send(image)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /images?limit=10&skip=20
// GET /images?sortBy=createdAt:desc
router.get('/images', async (req, res) => {
    const sort = {}


    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {

        const images = await Image.find({})
            .populate({
                path: 'images',
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }).exec()
        res.send(images)


    } catch (e) {
        res.status(400).send
    }

})

router.get('/myimages', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        await req.user.populate({
            path: 'images',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.images)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/images/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const image = await Image.findOne({ _id, owner: req.user._id })

        if (!image) {
            return res.status(404).send()
        }

        res.send(image)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/images/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'name', 'data', 'upvotes', 'tags']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const image = await Image.findOne({ _id: req.params.id, owner: req.user._id})

        if (!image) {
            return res.status(404).send()
        }

        updates.forEach((update) => image[update] = req.body[update])
        await image.save()
        res.send(image)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/images/:id', auth, async (req, res) => {
    try {
        const image = await Image.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!image) {
            res.status(404).send()
        }

        res.send(image)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router
