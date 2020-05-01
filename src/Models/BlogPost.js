const mongoose = require("mongoose");

const BlogPostSchema = new mongoose.Schema( {
    text: {
        type: String,
        required: true,
    },
    HeaderImage: {
        type: Buffer
    }
},{
    timestamps:true
})

const BlogPost = mongoose.model('BlogPost', BlogPostSchema)
module.exports = BlogPost;