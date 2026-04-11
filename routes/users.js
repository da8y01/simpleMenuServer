var express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.register(
      new User({ username: req.body.username }),
      req.body.password
    );

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).json({
        success: true,
        status: 'Registration Successful!'
      });
    });
  }
  catch (err) {
    console.log("Register error:", err);

    return res.status(500).json({
      success: false,
      err: err.message
    });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({success: true, status: 'You are successfully logged in!'});
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

module.exports = router;
