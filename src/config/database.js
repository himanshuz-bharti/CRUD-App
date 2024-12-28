const mongoose = require('mongoose');

const dbConnect = async ()=>{
    await mongoose.connect('mongodb+srv://Himanshu:Aman123456@cluster0.ikppogn.mongodb.net/sheriyanmini');
}
module.exports={dbConnect};