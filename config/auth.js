module.exports = {

    'facebookAuth' : {
        'clientID'      : '729151357245547', // your App ID
        'clientSecret'  : 'cf5e6dbaf31dccf0730492621d7de737', // your App Secret
        'callbackURL'   : 'http://localhost:8000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
