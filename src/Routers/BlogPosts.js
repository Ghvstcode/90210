const express = require('express')
const router = new express.Router()
const Post = require('../Models/BlogPost')
const multer = require('multer')
const isAuthenticated = require('../Middleware/auth')

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
router.post('/Newpost', isAuthenticated,/*upload.single('avatar'),*/ async (req, res) => {

    console.log(req)
    const post = new Post({
        ...req.body,
        owner: req.user._id
    })
    console.log(post)
    try {
        // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
        // req.user.avatar = buffer
        await post.save()
        res.status(201).send({post})
    } catch (e) {
        res.status(400).send(e)
    }
})

//Updating a post
//Authenticated
router.patch ('/user/blog/:id/update',/*auth,*/ async (req,res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['text', 'HeaderImage']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(404).send( { error: 'invalid update!'})
    }

    try {        
        // updates.forEach( (update)=> req.user[update] = req.body[update])
        // await req.user.save()
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true,})
        if (!post) {
            return res.status(404).send("Blog post not found")  
        }
        await req.post.save()
        res.send(req.post)
    } catch (e) {
        res.status(400).send(e)
    }
})



module.exports = router
