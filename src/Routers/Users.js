const express = require('express')
const router = new express.Router()
const User = require('../Models/User')

//Creating a new user
//NotAuthenticated
router.post('/newuser', async (req, res) => {
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
router.post('/login', async (req, res) => {
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

//Login with twitter

module.exports = router