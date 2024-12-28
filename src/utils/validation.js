const validator = require('validator');

const ValidateregisterData = (data) =>{
     const {username,email,password,age}=data;
     if(!validator.isEmail(email)) throw new Error('Not a valid email');
     if(age<18) throw new Error('Age should be greater than 18');
     if(!validator.isStrongPassword(password)) throw new Error('Password not strong enough'); 
     if(username.length<5) return new Error('Enter a  longer username');
}

module.exports = ValidateregisterData;