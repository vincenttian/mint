var Account = require('../app/models/account');
var Subuser = require('../app/models/subuser');
var User = require('../app/models/user');
var Goal = require('../app/models/goal');
var Budget = require('../app/models/budget');
var BetaUser = require('../app/models/betaUser');

// Node mailer
var mailerModule = require('../config/mailer');
var smtpTransport = mailerModule.smtpTransport;

module.exports = function(app, passport) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/beta', function(req, res) {
        res.render('beta.ejs');
    });

    app.post('/beta', function(req, res) {
        var newBetaUser = new BetaUser();
        newBetaUser.name = req.body.name;
        newBetaUser.user_email = req.body.email;
        newBetaUser.save(function(err) {
            if (err) throw err;
            var mailOptions = {
                from: "Mint Family <vincenttian16@gmail.com>", // sender address
                to: newBetaUser.user_email, // list of receivers
                subject: "Welcome to Mint Family!", // Subject line
                text: "At Mint Family, we welcome users to really work with their money.", // plaintext body
                html: "Hey " + newBetaUser.name + ", <br><br>Thanks for signing up with Mint Family! You have been added to the waiting list for the beta, and we will update you when Mint Family becomes available! <br><br> Best, <br>The Mint Family Team" // html body
            }
            // send mail with defined transport object
            smtpTransport.sendMail(mailOptions, function(error, response) {
                if (error) throw error;
                console.log("Message sent: " + response.message);
                res.redirect('thanks');
            });
        })
    });

    app.get('/thanks', function(req, res) {
        res.render('thanks.ejs');
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

    app.get('/budgets/:subuserName', isLoggedIn, function(req, res) {
        Subuser.find({
            'name': req.params.subuserName
        }, function(err, fam_member) {
            if (err) throw (err);
            Budget.find({
                'user_email': fam_member.user_email
            }, function(err, budgets) {
                if (err) return done(err);
                res.render('user_edit_budget.ejs', {
                    user: req.user,
                    budgets: budgets,
                    person: req.params.subuserName
                });
            });
        });
    });

    app.post('/edit_budget', isLoggedIn, function(req, res) {
        Subuser.find({
            'name': req.headers.referer.split('/')[4]
        }, function(err, subuser) {
            if (err) throw (err);
            var newBudget = new Budget();
            newBudget.name = req.body.name;
            newBudget.picture_url = req.body.picture;
            newBudget.amount = req.body.amount;
            newBudget.subuser_email = subuser[0].user_email;
            newBudget.added_by = req.user.local.email;
            newBudget.save(function(err) {
                if (err) throw err;
                res.redirect('/budgets/' + req.headers.referer.split('/')[4]);
            })
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

    app.get('/goals/:subuserName', isLoggedIn, function(req, res) {
        Subuser.find({
            'name': req.params.subuserName
        }, function(err, fam_member) {
            if (err) throw (err);
            Goal.find({
                'user_email': fam_member.user_email
            }, function(err, goals) {
                if (err) return done(err);
                res.render('user_edit_goal.ejs', {
                    user: req.user,
                    goals: goals,
                    person: req.params.subuserName
                });
            });
        });
    });

    app.post('/edit_goal', isLoggedIn, function(req, res) {
        Subuser.find({
            'name': req.headers.referer.split('/')[4]
        }, function(err, subuser) {
            if (err) throw (err);
            var newGoal = new Goal();
            newGoal.name = req.body.name;
            newGoal.picture_url = req.body.picture;
            newGoal.amount = req.body.amount;
            newGoal.description = req.body.description;
            newGoal.subuser_email = subuser[0].user_email;
            newGoal.added_by = req.user.local.email;
            newGoal.save(function(err) {
                if (err) throw err;
                res.redirect('/goals/' + req.headers.referer.split('/')[4]);
            })
        });
    });

    app.get('/subuser_budgets', isLoggedIn, function(req, res) {
        Budget.find({
            'subuser_email': req.user.local.email
        }, function(err, budgets) {
            if (err) throw err;
            res.render('subuser_budgets.ejs', {
                user: req.user,
                budgets: budgets
            });
        })
    });

    app.post('/subuser_budgets', isLoggedIn, function(req, res) {
        var newBudget = new Budget();
        newBudget.name = req.body.name;
        newBudget.picture_url = req.body.picture;
        newBudget.amount = req.body.amount;
        newBudget.subuser_email = req.user.local.email;
        newBudget.added_by = req.user.local.email;
        newBudget.save(function(err) {
            if (err) throw err;
            res.redirect('/subuser_budgets');
        })
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
        Goal.find({
            'subuser_email': req.user.local.email
        }, function(err, goals) {
            if (err) throw err;
            res.render('subuser_goals.ejs', {
                user: req.user,
                str_goals: JSON.stringify(goals),
                goals: goals
            });
        })
    });

    app.post('/subuser_goals', isLoggedIn, function(req, res) {
        var newGoal = new Goal();
        newGoal.name = req.body.name;
        newGoal.description = req.body.description;
        newGoal.picture_url = req.body.picture;
        newGoal.amount = req.body.amount;
        newGoal.subuser_email = req.user.local.email;
        newGoal.added_by = req.user.local.email;
        newGoal.save(function(err) {
            if (err) throw err;
            res.redirect('/subuser_goals');
        })
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
        newSubUser.user_email = req.body.email.toLowerCase();
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
                newUser.local.email = req.body.email.toLowerCase();
                newUser.local.password = newUser.generateHash(req.body.password);
                newUser.local.subuser = true;
                newSubUser.save(function(err) {
                    if (err) throw err;
                    newUser.save(function(err) {
                        if (err) throw err;
                        // setup e-mail data with unicode symbols
                        var mailOptions = {
                            from: "Mint Family <vincenttian16@gmail.com>", // sender address
                            to: newUser.local.email.toLowerCase(), // list of receivers
                            subject: "Welcome to Mint Family!", // Subject line
                            text: "At Mint Family, we welcome users to really work with their money.", // plaintext body
                            html: "At Mint Family, we welcome users to really work with their money. " + newSubUser.primary_user_email + " has signed you up with Mint Family to better manage your finances. Your login email is " + newSubUser.user_email + " and your password is " + newSubUser.password + ". Sign in at mintfamily.herokuapp.com to view your account, " + newSubUser.primary_account_name + "!" // html body
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
                'user_email': req.user.local.email.toLowerCase()
            }, function(err, subuser) {
                if (err) return done(err);
                Account.findOne({
                    'id': subuser.primary_account
                }, function(err, account) {
                    if (err) return done(err);
                    Goal.find({
                        'subuser_email': req.user.local.email
                    }, function(err, goals) {
                        if (err) return done(err);
                        Budget.find({
                            'subuser_email': req.user.local.email
                        }, function(err, budgets) {
                            if (err) return done(err);
                            res.render('subuser_profile.ejs', {
                                user: req.user,
                                account: account,
                                goals: goals,
                                budgets: budgets,
                                str_goals: JSON.stringify(goals),
                                str_budgets: JSON.stringify(budgets)
                            });
                        });
                    });
                });
            });
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


    app.use(function(req, res, next) {
        res.status(404);
        if (req.accepts('html')) {
            res.render('404.ejs');
            return;
        }
        if (req.accepts('json')) {
            res.send({
                error: 'Not found'
            });
            return;
        }
        res.type('txt').send('Not found');
    });
};

// route middleware to ensure user is logged in

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}
