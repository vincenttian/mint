// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var betaUserSchema = mongoose.Schema({
    // TODO: Replace user with user model
    user_email: String,
    name: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('BetaUser', betaUserSchema);
