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
  password: String,
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
  if (req.isAuthenticated()) {
    res.render('welcome.ejs');
  }
  else {
    res.redirect("/login");
  }

})

app.get('/login', (req, res) => {
  res.render('login.ejs')
});

app.get('/register', (req, res) => {
  res.render('register.ejs')
});

app.get("/logout", function (req, res) {
  req.logout(function () {

    res.redirect('/');

  });

})

app.post('/register', function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect('register');
    }
    else {
      passport.authenticate('local')(req, res, function () {
        res.redirect('welcome');
      })
    }

  })
});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    }
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/welcome");
      })
    }
  })
})


// blogs

const blogSchema = new mongoose.Schema({
  userID : String,
  blogTitle: String,
  blogContent: String,
  blogDate: String
});

const Blog = new mongoose.model("Blog", blogSchema);

// const blogs = [];

app.get('/blogs', (req, res) => {
  // console.log((blogs));
  Blog.find().then(myblogs=>{
    res.render('blogs.ejs',
    { blogs: myblogs });
  });
});

app.get('/compose', (req, res) => {
  res.render('compose.ejs');
});

app.post('/compose', (req, res) => {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDay();
  const yr = date.getFullYear();
  const newBlog = new Blog({
    blogContent:  req.body.content,
    blogTitle : req.body.title,
    blogDate : day+'/'+month+'/'+yr
  })
  newBlog.save();
  // 
  // const newBlog = {
  //   blogTitle: req.body.title,
  //   blogContent: req.body.content,
  //   blogDate: day+'/'+month+'/'+yr
  // }
  // blogs.push(newBlog);
  res.redirect('/blogs');
})

// // Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});