const mongoose = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const BlogPost = require('./BlogPost')
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Provide a valid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error ('invalid password')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    tokens:[{
        token: {
            type:String,
            required: true
        }
    }]
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
    //console.log(userObject)

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}

UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, 'blueferrari', {expiresIn: '1 day'})
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.pre('save', async function(next) {
    const user  = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    console.log('just before saving')
    next()
})

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

UserSchema.pre('remove', async function(next) {
    const user = this
    await BlogPost.deleteMany({ owner:user._id})
    next()
})

const User = mongoose.model('User', UserSchema)
module.exports = User;








// const me = new User({
//     name: 'Andrew',
//     age: 75
// })

// me.save().then(()=> {
//     console.log(me)
// }).catch((e)=> {
//     console.log(e)
// })