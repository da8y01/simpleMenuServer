var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

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