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
//console.log(mongoose.Schema.Types)
//if(BlogPostSchema.obj.owner.ref === 'User') 
const BlogPost = mongoose.model('BlogPost', BlogPostSchema)
module.exports = BlogPost;


// if(testBoolean){
//    object.attributeTwo = "attributeTwo"
// }else{
//    object.attributeTwo = "attributeTwoToo"
// }
// 2

// object.attributeTwo = testBoolean ? "attributeTwo" : "attributeTwoToo"