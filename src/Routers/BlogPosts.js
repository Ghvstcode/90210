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
router.post('/Newpost', isAuthenticated, async (req, res) => {

    const post = new Post({
        ...req.body,
        owner: req.user._id
    })
    console.log(post)
    try {
        await post.save()
        res.status(201).send({post})
    } catch (e) {
        res.status(400).send(e)
    }
})

//Updating a post
//Authenticated
router.patch ('/user/blog/update/:id',isAuthenticated, async (req,res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'content']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(404).send( { error: 'invalid update!'})
    }

    try {        
        // updates.forEach( (update)=> req.user[update] = req.body[update])
        // await req.user.save()
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false})
        if (!post) {
            return res.status(404).send("Blog post not found")  
        }

        await post.save()

        res.send(post)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Deleting a blog post
//Is authenticated
router.delete('/blog/:id/delete', isAuthenticated, async (req, res)=>{
    try {
         const post = await Post.findByIdAndDelete({_id:req.params.id,owner: req.user._ids})
         if(!post) {
            res.status(404).send("Blog post not found")
         }
         res.send(post)
     } catch (e) {
         res.status(500).send()
     }
 })
 



module.exports = router
