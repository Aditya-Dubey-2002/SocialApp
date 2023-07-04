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
const passportLocalMongoose = require('passport-local-mongoose');
const _ = require('lodash');

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


// Database

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Aditya:6zlz2WoiiilXCAeB@cluster0.knas0ja.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true });
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




// Authentication
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

let userId = ' ';

app.get('/welcome', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.render('welcome.ejs', { userName: req.user.username });
    userId = req.user.username;
  }
  else {
    res.redirect("/");
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
      userId = req.body.username;
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
      userId = req.body.username;
      passport.authenticate("local")(req, res, function () {
        res.redirect("/welcome");
      })
    }
  })
})


// blogs

const blogSchema = new mongoose.Schema({
  userID: String,
  blogTitle: String,
  blogContent: String,
  blogDate: String
});

const Blog = new mongoose.model("Blog", blogSchema);

// const blogs = [];


app.get('/blogs/:userName', (req, res) => {
  // console.log((blogs));
  // const delBlog=function(){
  //   console.log('deleted');
  //   // Blog.deleteOne({blogTitle:title});
  // }
  userId = req.params.userName;
  // console.log(userId);
  Blog.find().then(myblogs => {
    res.render('blogs.ejs',
      { blogs: myblogs, user: userId });
  });
});

app.get('/compose/:user', (req, res) => {
  res.render('compose.ejs',{user:req.params['user']});
});

app.post('/compose/:user', (req, res) => {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDay();
  const yr = date.getFullYear();
  const newBlog = new Blog({
    userID: userId,
    blogContent: req.body.content,
    blogTitle: req.body.title,
    blogDate: day + '/' + month + '/' + yr
  })
  newBlog.save();
  // 
  // const newBlog = {
  //   blogTitle: req.body.title,
  //   blogContent: req.body.content,
  //   blogDate: day+'/'+month+'/'+yr
  // }
  // blogs.push(newBlog);
  res.redirect('/blogs/'+req.params['user']);
})

app.get("/delete/:userName/:id", function (req, res) {
  const toEditTitle = (req.params['id']);
  userId = req.params['userName'];
  Blog.deleteOne({ _id: toEditTitle }).then(function () {
    Blog.find().then((docs) => {
      // console.log(docs);
      res.render("blogs.ejs", {
        blogs: docs, user: userId
      })
    })
      .catch((err) => {
        console.log(err);
      })
  })
    .catch(function (err) {
      console.log(err);
    })

  // console.log(blogToEdit);

})

// // Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});