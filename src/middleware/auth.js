const jwt  =require('jsonwebtoken');
const Usermodel = require('../models/users');
const userAuth = async (req,res,next)=>{
   try {
     const {token}=req.cookies;
     if(!token) throw new Error('Token does not exist');
     const decode = await jwt.verify(token,'PWD@123');
     const {_id,email}=decode;
     const founduser = await Usermodel.findOne({email});
     if(!founduser) throw new Error('User not found');
     else{
        req.user=founduser;
        next();
     }
   } catch (error) {
       res.status(400).send('Some error occured during authorization'+error.message);
   }
}
module.exports = userAuth;