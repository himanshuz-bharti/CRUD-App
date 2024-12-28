const mongoose = require('mongoose');
const {Schema}=mongoose;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = new Schema({
    username:String,
    email:String,
    password:String,
    age:Number,
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:'posts'}]
})
userSchema.methods.getJWT = async function(){
    const user=this;
    const token = await jwt.sign({email:user.email,userid:user._id},'PWD@123',{expiresIn:'2d'});
    return token;
}

userSchema.methods.passwordcheck=async function(enteredpassword){
    const isPasscorrect =  await bcrypt.compare(enteredpassword,this.password);
 
    return isPasscorrect;
}
const Usermodel = mongoose.model('user',userSchema);
module.exports=Usermodel;

