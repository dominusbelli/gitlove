const mongoose = require('mongoose');
const GitHubStrategy = require('passport-github').Strategy;
const User = require('./user.js');
//const config = require('../config.js');

const init = function PassportSetup(passport) {
  passport.serializeUser((user, callback)=>{
    callback(null, user._id);
  });

  passport.deserializeUser((_id, callback)=>{
    User.findOne({ '_id': _id }, (err, user)=>{
      callback(err, user);
    });
  });

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUBID,
    clientSecret: process.env.GITHUBSECRET,
    callbackURL: process.env.GITHUBCALLBACK,
    scope: [
      'user',
      'repo'
    ]
  }, (accessToken, refreshToken, profile, callback)=>{
    process.nextTick(()=>{
      User.findOne({'login': profile.login}, (err, user)=>{
        if (err) {
          callback(err);
        }

        if(user) {
          return callback(null, user);
        } else {
          var newUser = new User();

          newUser.login = profile.login;
          newUser.save((err)=>{
            if (err) {
              throw err;
            }
            return callback(null, newUser);
          });
        }
      });
    });
  }));
}

module.exports = init;
