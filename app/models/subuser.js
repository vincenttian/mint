// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var subUserSchema = mongoose.Schema({
    // TODO: Replace user with user model
    user_email: String,
    name: String,
    relation: String,
    password: String,
    primary_account: String,
    primary_user_email: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Subuser', subUserSchema);
