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

router.post('/user/forgotpassword', (req,res) => {
    const user = User.findOne({email: req.body.email})
    if(!user) {
        return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'})
    }

    user.generatePasswordReset();
    user.save().then((user)=> {
        console.log(user)
        //let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken
        //send mail to user.email
    })
    .catch(err => res.status(500).json({message: err.message}));
})


router.post('/user/recoverpassword', (req,res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

            //Generate and set password reset token
            user.generatePasswordReset();

            // Save the updated user object
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
                    const mailOptions = {
                        to: user.email,
                        from: process.env.FROM_EMAIL,
                        subject: "Password change request",
                        text: `Hi ${user.username} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    };

                    sgMail.send(mailOptions, (error, result) => {
                        if (error) return res.status(500).json({message: error.message});

                        res.status(200).json({message: 'A reset email has been sent to ' + user.email + '.'});
                    });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));
})
router.post = (req, res) => {

};

module.exports = router

//505dcf72b662b0f129693b0ba470d35850c9eb13