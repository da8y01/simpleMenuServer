var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
passportLocalMongoose = passportLocalMongoose.default || passportLocalMongoose;

var User = new Schema({
  admin: {
    type: Boolean,
    default: false
  }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);