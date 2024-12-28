const express = require('express');
const path=require('path');
const {dbConnect}=require('./config/database.js');
const cookieParser = require('cookie-parser');
const Usermodel = require('./models/users.js');
const Postmodel=require('./models/posts.js');
const bcrypt=require('bcrypt');
const ValidateregisterData = require('./utils/validation.js');
const validator = require('validator');
const userAuth = require('./middleware/auth.js');
const app=express();

app.set('view engine','ejs');
app.set('views',path.resolve('./src/views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());



app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/login',(req,res)=>{
    res.render('login');
})
app.post('/register',async (req,res)=>{
    try {
        const userObj=req.body;
        console.log(userObj);
        ValidateregisterData(userObj);
        const {username,email,password,age}=userObj;
        const founduser = await Usermodel.findOne({email});
        if(founduser) throw new Error('User already exists');
        const hashedpassword = await bcrypt.hash(password,10);
        const newUser = new Usermodel({username,email,password:hashedpassword,age});
        await newUser.save();
        const token = await newUser.getJWT();
        res.cookie('token',token,{
            expires:new Date(Date.now()+8*320000),
        })
        res.status(200).send('User registered succesfully');
    } catch (error) {
        res.status(400).send('Error occured while registering the user'+error.message);
    }
})

app.post('/login',async(req,res)=>{
    try {
        const {email}=req.body;
        const enteredpassword = req.body.password;
        const isEmail=validator.isEmail(email);
        if(!isEmail) throw new Error('invalid credentials');
        const founduser = await Usermodel.findOne({email});
        if(!founduser) throw new Error('No such user exists. Please signup');
        const passcorrect = await founduser.passwordcheck(enteredpassword);
        //console.log(passcorrect);
        if(!passcorrect) throw new Error('Invalid credentials');
        else{
            const token = await founduser.getJWT();
            res.cookie('token',token,{
                expires:new Date(Date.now()+8*320000)
            });
            res.redirect('/profile');
        }
    } catch (error) {
        res.status(400).send('Error in logging the user:'+error.message);
    }
})

app.post('/posts',userAuth,async (req,res)=>{
    try {
        const {post}=req.body;
        const {user} = req;
        const newPost = new Postmodel({userID:user._id,content:post});
        await newPost.save();
         user.posts.push(newPost._id);
         await user.save();
        res.redirect('/profile');
    } catch (error) {
        res.status(400).send('Some error occured during posting'+error.message);
    }
})

app.get('/like/:postID',userAuth,async (req,res)=>{
    try {
        const referer = req.get('Referer');
        const user=req.user;
        const {postID}=req.params;
        const postfind = await Postmodel.findById(postID);
        const idx = postfind.likes.indexOf(user._id);
        if(idx===-1){
            postfind.likes.push(user._id);
            await postfind.save();
        }
        else{
            postfind.likes.splice(idx,1);
            await postfind.save();
        }
        if(referer.includes('/profile')) res.redirect('/profile');
        else res.redirect('/feed');
    } catch (error) {
        res.status(400).send('Some error occured during liking'+error.message);
    }
})

app.get('/edit/:postID',userAuth,async (req,res)=>{
    try {
        const user=req.user;
        const {postID}=req.params;
        const postfind = await Postmodel.findById(postID);
        res.render('edit',{
            postfind
        });
        
    } catch (error) {
        res.status(400).send('Some error occured during liking'+error.message);
    }
})
app.post('/edit/:postID',userAuth,async(req,res)=>{
    try {
        const referer = req.get('Referer');
        const {editedpost} = req.body;
        console.log("content",editedpost);
        const {postID}=req.params;
        const postfind = await Postmodel.findById(postID);
        postfind.content=editedpost;
        await postfind.save();
        if(referer.includes('/profile')) res.redirect('/profile');
        else res.redirect('/feed');
    } catch (error) {
        res.status(400).send('Some error occured during editing:'+error.message);
    }
})
app.get('/delete/:postID',userAuth,async(req,res)=>{
    try {
        const referer = req.get('Referer');
        const {postID}=req.params;
        const {user}=req;
        await Postmodel.findByIdAndDelete(postID);
        const index = user.posts.indexOf(postID);
        console.log(index);
        user.posts.splice(index,1);
        await user.save();
        if(referer.includes('/profile')) res.redirect('/profile');
        else res.redirect('/feed');
    } catch (error) {
        res.status(400).send('Some error occured during deletion'+error.message);
    }
})
app.get('/profile',userAuth,async (req,res)=>{
    const user=req.user;
    await user.populate('posts','content likes');
    res.render('profile',{
        user
    });
})
app.get('/logout',async(req,res)=>{
    try {
        res.cookie('token',null,{
            expires:new Date(Date.now())
        })
        res.redirect('/login');
    } catch (error) {
        res.status(400).send('User logge dout succesfully');
    }
})
app.get('/feed',userAuth,async (req,res)=>{
    const feed = await Postmodel.find({}).populate('userID');
    //console.log(feed);
    const {user}=req;
    res.render('feed',{
        feed,user
    })
})
dbConnect().then(()=>{
    console.log('Database connected');
    app.listen(3000,()=>{
        console.log('app is lstening on port 3000');
    })
}).catch((error)=>{
    console.error('Error connecting database'+error.message);
})