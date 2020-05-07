const express = require('express')
const router = new express.Router()
const User = require('../Models/User')
const isAuthenticated = require('../Middleware/auth')
const Post = require('../Models/BlogPost')
const githubUser = require('../Models/GithubUser')
const axios = require('axios');
let token = null;
const client_id = "893912dc63ad4e40b06c"
const client_secret = "66f5a100c8968fe473d203de95bcf96adb908f5c"//Change this oh abeg
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
router.get('/user/login/authorize', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=user:email`);
});


router.get('/oauth-callback', (req, res) => {
    const body = {
      client_id: client_id,
      client_secret: client_secret,
      code: req.query.code
    };
    const opts = { headers: { accept: 'application/json'} };
    let one = `https://github.com/login/oauth/access_token`
    let two = 'https://api.github.com/user'

    try {
        axios.post(one,body,opts).then((githubres) => {
            const githubUserToken = githubres.data['access_token']
            const options = { headers: { accept: 'application/json', Authorization: 'token ' + githubUserToken} };
            const requestTwo = axios.get(two, options);
    
            requestTwo.then((response)=> {
                if (response.status != 200) {
                    throw new Error()
                }
                const githubUsername = response.data.name
                const githubEmail = response.data.email
    
                if(githubEmail === null) {
                    const socialUser = new githubUser({name: githubUsername, token: githubUserToken})
                    socialUser.save().then((user)=> {
                        res.status(200).send(user)
                    }).catch((err)=> {
                        res.status(500).json({ message: err.message })
                    })
                } 
    
                if(githubEmail) {
                    const socialUser = new githubUser({name: githubUsername, token: githubUserToken, email: githubEmail})
                    socialUser.save().then((user)=> {
                        res.status(200).send(user)
                    }).catch((err)=> {
                        res.status(500).json({ message1: err.message })
                    })
                }
            }).catch((e) => {
                res.status(500).json({ message: e.message })
            })
        }).catch((e) => {
            res.status(500).json({ message: e.message })
        })
    }catch (e) {
        res.status(500).json({ message: e.message })
    }    
    
})

//Viewing your profile and all your posts
router.get('/users/profile', isAuthenticated, async (req,res) => {
    try {
        const user = req.user//await User.findByCredentials(req.body.email, req.body.password)
        const post = await Post.find({owner: req.user._id})
        res.send({
            user, 
            post
        })
    } catch (e) {
        res.status(404).send(e)
    }

})

module.exports = router