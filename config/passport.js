
// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var pg = require('pg');
var conString = "postgres://AdminMyBlog:123456@localhost:5432/myBlogAdmin";
// load up the user model

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'emails', 'name', 'photos']
    },

    // facebook will send back the token and profile
    function(token,refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
          var client = new pg.Client(conString);
          client.connect();
          console.log(typeof(profile.id));
// find the user in the database based on their facebook id
          client.query("SELECT username FROM users where username = $1 ", profile.id , function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                console.log('aaaaa');
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var User ={
                      usernane : '',
                      email: '',
                      name: '',
                      password: '',
                      ava: ''
                    }
                    // set all of the facebook information in our user model
                    User.username    = profile.id; // set the users facebook id
                    User.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    User.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    User.ava  = profile.photos ? profile.photos[0].value : '/imagesg/ava-default.png';
                    User.password = profile.emails[0].value;
                    // save our user to the database
                    client.query("INSERT INTO users(username, password, email, ava, name) VALUE($1::VARCHAR, $2 , $3, $4, $5));",
                               [  User.username, User.password, User.email, User.ava, User.name], function (err, rows){
                                 if (err){
                                   return done(err);
                                 }
                                client.end();
                    });
                    return done(null, User);

                  }});
                });

        }));

};
