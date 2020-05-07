const jwt = require('jsonwebtoken')
const User = require('../Models/User')
const githubUser = require('../Models/GithubUser')


const auth =  async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'blueferrari')//REMEMBER TO HIDE SECRET
        const user =  await User.findOne({ _id:decoded._id, 'tokens.token': token})
        const socialUser = await githubUser.findOne({token: token})
        if(!user || socialUser) {
            throw new Error
        } 

        req.token = token
        req.user = user
        next()
    } catch(e) {
        res.status(401).send({ error: 'Please authenticate'})
    }
}

module.exports = auth

//893912dc63ad4e40b06c

//66f5a100c8968fe473d203de95bcf96adb908f5c