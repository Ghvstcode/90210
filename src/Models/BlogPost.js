const mongoose = require("mongoose");
const User = require('./User')

const BlogPostSchema = new mongoose.Schema( {
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps:true
})

const BlogPost = mongoose.model('BlogPost', BlogPostSchema)
module.exports = BlogPost;