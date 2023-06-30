if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override');
const encrypt = require('mongoose-encryption');
const passportLocalMongoose = require('passport-local-mongoose')

// const initializePassport = require('./passport-config')
// initializePassport(
//   passport,
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
// )



app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


mongoose.connect("mongodb://localhost:27017/mySpaceUsersDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const secret = process.env.SESSION_SECRET;
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/welcome', (req, res) => {
  if(req.isAuthenticated()){
    res.render('welcome.ejs');
  }
  else{
    res.redirect("/login");
  }
  
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
});

app.get('/register', (req, res) => {
  res.render('register.ejs')
});

app.get("/logout",function(req,res){
  req.logout(function(){
    
      res.redirect('/');
    
  });
  
})

app.post('/register', function (req, res) {
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect('register');
    }
    else{
      passport.authenticate('local')(req,res,function(){
        res.redirect('welcome');
      })
    }

  })
});

app.post('/login', (req, res) => {
  const user = new User({
    username : req.body.username,
    password:req.body.password
  })
  req.login(user,function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/welcome");
      })
    }
  })
})























////////
// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//   successRedirect: '/',
//   failureRedirect: '/login',
//   failureFlash: true
// }))



// app.post('/register', checkNotAuthenticated, async (req, res) => {
//   try {

//     const hashedPassword = await bcrypt.hash(req.body.password, 10)
//     const newUser = new User({
//       email : req.body.name,
//       name : req.body.password,
//       password :hashedPassword
//     })
//     newUser.save(function(err){
//       if(err){
//         console.log(err)
//       }
//       else{
//         res.redirect('/login');
//       }
//     })

//   } catch {
//     res.redirect('/register');
//   }
// })

// app.delete('/logout', (req, res) => {
//   req.logOut()
//   res.redirect('/login')
// })

// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next()
//   }

//   res.redirect('/login')
// }

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   next()
// }

// // Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});