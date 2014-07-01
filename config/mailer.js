var nodemailer = require("nodemailer");

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "intuitmintfamily@gmail.com",
        pass: configAuth.mailer
    }
});

exports.smtpTransport = smtpTransport;
