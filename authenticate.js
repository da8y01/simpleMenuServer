var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');
var OAuth2Strategy = require('passport-oauth2');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var User = require('./models/user');
var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretKey
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        console.log("JWT payload:", jwt_payload);

        const user = await User.findById(jwt_payload._id);

        if (user) {
            return done(null, user);
        }

        return done(null, false);
    }
    catch (err) {
        return done(err, false);
    }
}));

exports.verifyUser = passport.authenticate('jwt', {
    session: false
});

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));

exports.googleOA2Passport = passport.use(new OAuth2Strategy({
    authorizationURL: config.google.authorizationURL,
    tokenURL: config.google.tokenURL,
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
}, function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ exampleId: profile.id }, function (err, user) {
        return cb(err, user);
    });
}
));

exports.googlePassport = passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try {

        let user = await User.findOne({
            googleId: profile.id
        });

        if (user) {
            return done(null, user);
        }

        user = new User({
            username: profile.emails[0].value
        });

        user.googleId = profile.id;

        if (profile.name) {
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
        }

        await user.save();

        return done(null, user);

    } catch (err) {
        return done(err, false);
    }
})
);