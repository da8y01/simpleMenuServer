module.exports = {
    'secretKey': process.env.SECRET_KEY,
    'mongoUrl': process.env.MONGODB_URL,
    'google': {
        clientId: process.env.G_CLIENT_ID,
        clientSecret: process.env.G_CLIENT_SECRET,
        authorizationURL: process.env.G_AUTH_URL,
        tokenURL: process.env.G_TOKEN_URL,
        callbackURL: process.env.G_CB_URL
    },
    'facebook': {
        clientId: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET
    }
}
