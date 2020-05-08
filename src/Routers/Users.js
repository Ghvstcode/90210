
const express = require('express')
const router = new express.Router()
const User = require('../Models/User')
const isAuthenticated = require('../Middleware/auth')
const Post = require('../Models/BlogPost')
const githubUser = require('../Models/GithubUser')
const axios = require('axios');
let token = null;
const sendResetEmail = require('../utils/resetEmail') 
const client_id = process.env.client_id
const client_secret = process.env.client_secret

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
                console.log(githubUserToken)
    
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
                        res.status(401).json({ message: err.message })
                        console.log({ message: err})
                    })
                }
            }).catch((e) => {
                res.status(401).json({ message: e.message })
                console.log(e)
            })
        }).catch((e) => {
            res.status(401).json({ message: e.message })
            console.log(e)
        })
    }catch (e) {
        res.status(401).json({ message: e.message })
        console.log(e)
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

router.post('/user/forgotpassword', async (req,res) => {
    const email = req.body.email
    const user = await User.findOne({email: email})
    if(!user) {
        return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'})
    }
    user.generatePasswordReset();
    try {
        let resetToken = user.resetPasswordToken
        console.log(resetToken)
        user.save()
        sendResetEmail(email, resetToken)
        res.status(200).send("Reset email sent")
    } catch (e) {
        //console.log(e)
        res.status(400).send(e)
    }
})

router.post('/user/resetPassword', async (req,res)=> {
    const {newPassword, resetToken} =req.body
	try {
		const user = await User.findOne(
			//{ resetTokenExpirationDate: { $gt: Date.now() } },
			{ resetToken: resetToken },
		);
		if (!user) {
			return res.status(400).send("Unable to reset password")
        }
        user.password = newPassword;
		user.resetToken = undefined;
		user.resetTokenExpirationDate = undefined;
		await user.save();
        return res.status(200).send("password reset succesful")
	} catch (err) {
		res.status(500).send(err.message);
	}
})


module.exports = router

