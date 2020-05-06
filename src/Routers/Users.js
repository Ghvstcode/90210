const express = require('express')
const router = new express.Router()
const User = require('../Models/User')
const isAuthenticated = require('../Middleware/auth')
const Post = require('../Models/BlogPost')
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


router.get('/oauth-callback', async (req, res) => {
    let githubUserToken = ""
    const body = {
      client_id: client_id,
      client_secret: client_secret,
      code: req.query.code
    };
    const opts = { headers: { accept: 'application/json', Authorization: 'token ' + token} };
    let one = `https://github.com/login/oauth/access_token`
    let two = 'https://api.github.com/user'


  
    axios.post(one,body,opts).then(res => res.data['access_token']).
      then(_token => {
        githubUserToken = _token;
        console.log('My token:', githubUserToken);
        const options = { headers: { accept: 'application/json', Authorization: 'token ' + githubUserToken} };
        const requestTwo = axios.get(two, options);
        requestTwo.then((response)=> {
            const githubUsername = response.data.name
            const githubEmail = response.data.email
            console.log(githubUsername)
            console.log(githubEmail)
            console.log(githubUserToken)
        })
       /*const githubUser =  new User ({tokens : [{token: token}]})
       console.log(githubUser)
        githubUser.save().then((user)=> {
            res.status(200).send(user)
            console.log('saved')
        }).catch((err)=> {
            res.status(500).json({ message: err.message })
         }) */
        res.json({ ok: 1 });	

      }).
      catch(err => res.status(500).json({ message: err.message }));





    
    // axios.post(`https://github.com/login/oauth/access_token`, body, opts).
    //   then(res => res.data/*['access_token']*/).
    //   then(_token => {
    //     token = _token;
    //     console.log('My token:', token);
    //    /*const githubUser =  new User ({tokens : [{token: token}]})
    //    console.log(githubUser)
    //     githubUser.save().then((user)=> {
    //         res.status(200).send(user)
    //         console.log('saved')
    //     }).catch((err)=> {
    //         res.status(500).json({ message: err.message })
    //      }) */
    //     res.json({ ok: 1 });	
    //     fetch('https://api.github.com/user', {
	// 		headers: {
	// 			// Include the token in the Authorization header
	// 			Authorization: 'token ' + token
	// 		}
	// 	})
	// 	// Parse the response as JSON
	// 	.then(res => res.json())
	// 	.then(res => {
	// 		// Once we get the response (which has many fields)
	// 		// Documented here: https://developer.github.com/v3/users/#get-the-authenticated-user
	// 		// Write "Welcome <user name>" to the documents body
	// 		console.log(res)
	// 	})
    //   }).
    //   catch(err => res.status(500).json({ message: err.message }));

    
});

//   router.get('/oauth-callback', (req, res) => {
//     const body = {
//       client_id: client_id,
//       client_secret: client_secret,
//       code: req.query.code
//     };
//     let one = 
//     const opts = { headers: { accept: 'application/json' } };
//     axios.post(`https://github.com/login/oauth/access_token`, body, opts).
//       then(res => res.data/*['access_token']*/).
//       then(_token => {
//         token = _token;
//         console.log('My token:', token);
//        /*const githubUser =  new User ({tokens : [{token: token}]})
//        console.log(githubUser)
//         githubUser.save().then((user)=> {
//             res.status(200).send(user)
//             console.log('saved')
//         }).catch((err)=> {
//             res.status(500).json({ message: err.message })
//          }) */
//         res.json({ ok: 1 });	
//         fetch('https://api.github.com/user', {
// 			headers: {
// 				// Include the token in the Authorization header
// 				Authorization: 'token ' + token
// 			}
// 		})
// 		// Parse the response as JSON
// 		.then(res => res.json())
// 		.then(res => {
// 			// Once we get the response (which has many fields)
// 			// Documented here: https://developer.github.com/v3/users/#get-the-authenticated-user
// 			// Write "Welcome <user name>" to the documents body
// 			console.log(res)
// 		})
//       }).
//       catch(err => res.status(500).json({ message: err.message }));

    
//   });

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