var Account = require('../app/models/account');
var Subuser = require('../app/models/subuser');
var User = require('../app/models/user');

// Node mailer
var mailerModule = require('../config/mailer');
var smtpTransport = mailerModule.smtpTransport;

module.exports = function(app, passport) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/budgets', isLoggedIn, function(req, res) {
        Subuser.find({
            'primary_user_email': req.user.local.email
        }, function(err, fam_members) {
            if (err) return done(err);
            if (fam_members) {
                Account.find({
                    'user_email': req.user.local.email
                }, function(err, accounts) {
                    res.render('budget.ejs', {
                        user: req.user,
                        fam_members: fam_members,
                        accounts: JSON.stringify(accounts)
                    });
                });
            }
        });
    });

    app.get('/goals', isLoggedIn, function(req, res) {
        Subuser.find({
            'primary_user_email': req.user.local.email
        }, function(err, fam_members) {
            if (err) return done(err);
            if (fam_members) {
                Account.find({
                    'user_email': req.user.local.email
                }, function(err, accounts) {
                    res.render('goal.ejs', {
                        user: req.user,
                        fam_members: fam_members,
                        accounts: JSON.stringify(accounts)
                    });
                });
            }
        });
    });

    app.get('/subuser_budgets', isLoggedIn, function(req, res) {
        res.render('subuser_budgets.ejs', {
            user: req.user,
        });
    });

    app.get('/subuser_family', isLoggedIn, function(req, res) {
        // implement this
        Subuser.findOne({
            'user_email': req.user.local.email
        }, function(err, u) {
            if (err) {
                console.log(err);
                return;
            }
            User.findOne({
                'local.email': u.primary_user_email
            }, function(err, user) {
                if (err) throw err;
                Subuser.find({
                    'primary_user_email': user.local.email
                }, function(err, fam_members) {
                    if (err) return done(err);
                    res.render('subuser_family.ejs', {
                        user: req.user,
                        fam_members: fam_members,
                        primary: user
                    });
                });
            });
        })


        // res.render('subuser_family.ejs', {
        //     user: req.user,
        // });
    });

    app.get('/subuser_goals', isLoggedIn, function(req, res) {
        res.render('subuser_goals.ejs', {
            user: req.user,
        });
    });

    app.get('/family', isLoggedIn, function(req, res) {
        // Query for all family members
        Subuser.find({
            'primary_user_email': req.user.local.email
        }, function(err, fam_members) {
            if (err) return done(err);
            if (fam_members) {
                console.log('found family members');
                Account.find({
                    'user_email': req.user.local.email
                }, function(err, accounts) {
                    res.render('family.ejs', {
                        user: req.user,
                        fam_members: fam_members,
                        accounts: JSON.stringify(accounts)
                    });
                });
            } else {
                console.log('no fam_members found');
                res.render('family.ejs', {
                    user: req.user,
                    fam_members: fam_members
                });
            }
        });
    });

    app.post('/family', isLoggedIn, function(req, res) {
        var newSubUser = new Subuser();
        newSubUser.user_email = req.body.email;
        newSubUser.name = req.body.name;
        newSubUser.relation = req.body.relation;
        newSubUser.password = req.body.password;
        newSubUser.primary_user_email = req.user.local.email;
        var account = req.body.account_no.split(':');
        newSubUser.primary_account = account[0];
        newSubUser.primary_account_name = account[1] + ': ' + account[2];
        Account.find({
            'id': account[0]
        }, function(err, account) {
            if (err) return done(err);
            if (account.length > 0) {
                var newUser = new User();
                newUser.local.email = req.body.email;
                newUser.local.password = newUser.generateHash(req.body.password);
                newUser.local.subuser = true;
                newSubUser.save(function(err) {
                    if (err) throw err;
                    newUser.save(function(err) {
                        if (err) throw err;
                        console.log('setup mailer here');

                        // setup e-mail data with unicode symbols
                        var mailOptions = {
                            from: "Mint Family ✔ <vincenttian16@gmail.com>", // sender address
                            to: newUser.local.email, // list of receivers
                            subject: "Welcome to Mint Family!", // Subject line
                            text: "At Mint Family, we welcome users to really work with their money.", // plaintext body
                            html: "<b>At Mint Family, we welcome users to really work with their money. " + newSubUser.primary_user_email + " has signed you up with Mint Family to better manage your finances. Your login email is " + newSubUser.local.email + " and your password is " + newSubUser.local.password + ". Sign in at mintfamily.herokuapp.com!</b>" // html body
                        }

                        // send mail with defined transport object
                        smtpTransport.sendMail(mailOptions, function(error, response) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                            console.log("Message sent: " + response.message);
                            res.redirect('/family');
                        });
                    })
                });
            } else { // no such account exist
                console.log('no such account');
                res.redirect('family');
            }
        });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        if (req.user.local.subuser == false) {
            Account.find({
                'user_email': req.user.local.email
            }, function(err, accounts) {
                if (err) return done(err);
                if (accounts) {
                    res.render('profile.ejs', {
                        user: req.user,
                        accounts: accounts
                    });
                } else {
                    console.log('no accounts linked');
                    res.render('profile.ejs', {
                        user: req.user,
                        accounts: accounts
                    });
                }
            });
        } else {
            Subuser.findOne({
                'user_email': req.user.local.email
            }, function(err, subuser) {
                if (err) return done(err);
                Account.findOne({
                    'id': subuser.primary_account
                }, function(err, account) {
                    if (err) return done(err);
                    res.render('subuser_profile.ejs', {
                        user: req.user,
                        account: account
                    })
                })
            })
        }
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: 'email'
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', {
        scope: 'email'
    }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', {
            message: req.flash('loginMessage')
        });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {
        scope: 'email'
    }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', {
        scope: 'email'
    }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {
        scope: ['profile', 'email']
    }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}
