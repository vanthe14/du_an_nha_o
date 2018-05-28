module.exports = {
    'facebookAuth': {
        'clientID': '737231243120097', // your App ID
        'clientSecret': '02e0859c3890851abf9d6230426c5e39', // your App Secret
        'callbackURL': '../thanh-vien/facebook/callback',
        'profileFields': ['birthday', 'emails', 'first_name', 'last_name']
    },

    'twitterAuth': {
        'consumerKey': 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL': '../khach-hang/twitter/callback'
    },

    'googleAuth': {
        'clientID': 'your-google-client-id',
        'clientSecret': 'your-google-secret-client',
        'callbackURL': '../khach-hang/google/callback'
    }

};