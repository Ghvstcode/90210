const express = require('express')
const router = new express.Router()
const Post = require('../Models/BlogPost')

//Creating a new post
//Authenticated
router.post('/Newpost', async (req, res) => {
    const post = new Post (req.body)
    try {
        await post.save()
        res.status(201).send({post})
    } catch (e) {
        res.status(400).send(e)
    }
})



module.exports = router
