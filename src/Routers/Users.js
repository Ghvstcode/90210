const express = require('express')
const router = new express.Router()
const User = require('../Models/User')
const isAuthenticated = require('../Middleware/auth')

//Creating a new user
//NotAuthenticated
router.post('/users/newuser', async (req, res) => {
    const user = new User (req.body)
    const token = await user.generateAuthToken()
    try {
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//Logging In a User
//NotAuthenticated
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()
        if(!user) {
            throw  new Error ('Unable to login')
        }
        res.status(200).send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }
})

//Login with github

//Viewing your profile and all your posts
router.get('/users/profile', isAuthenticated, async (req,res) => {
    const post = await Post.findbyId({_id,owner: req.user._id})
    res.send(req.user, post)
})

module.exports = router