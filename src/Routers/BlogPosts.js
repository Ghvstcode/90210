const express = require('express')
const router = new express.Router()
const Post = require('../Models/BlogPost')
const multer = require('multer')

const upload = multer({
    limit: {
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file format is not supported'))
        }
        cb(undefined, true)
    }
})

//Creating a new post
//Authenticated
router.post('/Newpost', upload.single('avatar'), async (req, res) => {

    console.log(req.body)
    const post = new Post (req.body)
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
        req.user.avatar = buffer
        await post.save()
        res.status(201).send({post})
    } catch (e) {
        res.status(400).send(e)
    }
})

//Updating a post
//Authenticated



module.exports = router
