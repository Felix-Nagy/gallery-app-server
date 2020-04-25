const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
        data: {
            type: Buffer,
            required: true
        },
        name: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        likes: {
            type: Number
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true
    })

const Image = mongoose.model('Image', imageSchema)

module.exports = Image
