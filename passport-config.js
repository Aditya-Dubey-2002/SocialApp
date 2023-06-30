const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    User.findOne({email:email},function(err,foundUser){
      if(err){
        console.log(err);
      }
      else{
        if(foundUser){
          if (bcrypt.compare(password, foundUser.password)) {
                return done(null, foundUser)
              } else {
                return done(null, false, { message: 'Password incorrect' })
              }
        }
      }
    })
    // const user = getUserByEmail(email)
    // if (user == null) {
    //   return done(null, false, { message: 'No user with that email' })
    // }

    // try {
    //   if (await bcrypt.compare(password, user.password)) {
    //     return done(null, user)
    //   } else {
    //     return done(null, false, { message: 'Password incorrect' })
    //   }
    // } catch (e) {
    //   return done(e)
    // }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize