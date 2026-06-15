var express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport');
var User = require('../models/user');
var authenticate = require('../authenticate');
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, async function (req, res, next) {
  var users = await User.find({});
  return res.status(200).json(users);
});

router.post('/signup', cors.corsWithOptions, async (req, res, next) => {

  try {

    const user = await User.register(
      new User({ username: req.body.username }),
      req.body.password
    );

    if (req.body.firstname)
      user.firstname = req.body.firstname;
    if (req.body.lastname)
      user.lastname = req.body.lastname;

    await user.save();

    res.status(200).json({
      success: true,
      status: 'Registration Successful!'
    });

  }
  catch(err) {

    res.status(500).json({
      success: false,
      err: err.message
    });

  }
});

router.post('/login', cors.corsWithOptions, async (req, res, next) => {

  passport.authenticate('local', { session: false },
    (err, user, info) => {

      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          status: 'Login unsuccessful!'
        });
      }

      const token = authenticate.getToken({
        _id: user._id
      });

      return res.status(200).json({
        success: true,
        token: token,
        status: 'You are successfully logged in!'
      });

    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

router.get('/google/token', passport.authenticate('google', { scope: ['profile', 'email'] }), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;
