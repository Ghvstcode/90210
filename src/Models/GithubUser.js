const mongoose = require("mongoose");
const BlogPost = require('./BlogPost')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    category: {
        type: String,
        default: "githubUser",
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







