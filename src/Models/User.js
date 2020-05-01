const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        // validate(value) {
        //     if (value.toLowerCase().includes('password')) {
        //         throw new Error ('invalid password')
        //     }
        // }
    },
    star : {
        type: Boolean,
        default: false
    },
    avatar: {
        type: Buffer
    }
},{
    timestamps:true
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