const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user' 
    },
    content:String,
    likes:[{
        type:mongoose.Schema.Types.ObjectId, ref:'user'
    }]
},{
    timestamps:true
})

const Postmodel = mongoose.model('posts',postSchema);
module.exports=Postmodel;