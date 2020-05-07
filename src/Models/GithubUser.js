const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const BlogPost = require('./BlogPost')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
    },
    avatar: {
        type: Buffer
    },
    token: {
        type:String,
        required: true
    }
},{
    timestamps:true
})
UserSchema.virtual('BlogPost', {
    ref: 'BlogPost',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}

UserSchema.pre('remove', async function(next) {
    const user = this
    await BlogPost.deleteMany({ owner:user._id})
    next()
})

const githubUser = mongoose.model('githubUser', UserSchema)
module.exports = githubUser;








// const me = new User({
//     name: 'Andrew',
//     age: 75
// })

// me.save().then(()=> {
//     console.log(me)
// }).catch((e)=> {
//     console.log(e)
// })