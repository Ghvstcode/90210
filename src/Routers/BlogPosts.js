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
router.post('/blog/Newpost', isAuthenticated, async (req, res) => {

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
router.patch ('/blog/update/:id',isAuthenticated, async (req,res) => {
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
//Searching for a users 
//Not authenticated
// router.get('/blog/:id', isAuthenticated, async (req,res) => {
//     const _id = req.params.id
//     try {
//         const post = await Post.findOne({_id,owner: req.user._id})
//         if (!post) {
//             return res.status(404).send("You do not have any blogposts")
//         }
//         res.send(post)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })
router.get('/blogposts', isAuthenticated, async (req,res) => {
    const match =  {}
    const sort = {}
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
    }
    if(req.query.title) {
        match.title = req.query.title
    }
    try {
        await req.user.populate({
            path: 'blogposts',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.blogposts)
    } catch(e) {
        console.log(e)
        res.status(500).send(e)
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
         res.status(500).send("Unable to delete document")
     }
 })
 



module.exports = router
