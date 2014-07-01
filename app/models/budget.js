// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var budgetSchema = mongoose.Schema({
    // TODO: Replace user with user model
    name: String,
    picture_url: String,
    amount: String,
    subuser_email: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Budget', budgetSchema);
