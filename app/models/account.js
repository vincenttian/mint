// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var accountSchema = mongoose.Schema({
    // TODO: Replace user with user model
    user_email: String,
    isActive: String,
    value: String,
    currency: String,
    interest_rate: String,
    last_updated: String,
    financial_institution_name: String,
    account_type: String,
    account_name: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Account', accountSchema);
