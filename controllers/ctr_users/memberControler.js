var passport = require('passport');
var async = require('async');
var crypto = require('crypto');

exports.get_register = function(req, res, next){
    var messages = req.flash('error');
    res.render('register',{
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
}

// POST Regsiter
exports.post_regsiter = passport.authenticate('local.register', {
    successRedirect: '/',
    failureRedirect: '/thanh-vien/dang-ky',
    badRequestMessage: 'Vui lòng nhập những thông tin yêu cầu vào các mục bên dưới.',
    failureFlash: true
});

//GET Login
exports.get_login = function(req, res, next){
    var messages = req.flash('error');
    res.render('login',{
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
}
//GET Login
exports.post_login = function(req, res, next) {
    passport.authenticate('local.login', function(err, user, info) {
        if (err) {
            console.log("qua day1")
            req.flash('error', req.__(err));
            return next(err);
        }
        if (!user) {
            console.log("qua day2")
           // req.flash('error', req.__('authen.account_not_exist'));
            return res.redirect('/thanh-vien/dang-nhap');
        }
        req.logIn(user, function(err) {
            if (err) {
                req.flash('error', req.__("login error"));
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
};

// GET Facebook login
exports.get_facebook_login = passport.authenticate('facebook', {
    scope: 'email'
});

// GET Facebook callback login
exports.get_facebook_callback_login = passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/tai-khoan/dang-nhap'
});