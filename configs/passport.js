var validator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var settings = require('../configs/settings');
var Member = require('../models/mdl_users/member');
var configAuth = require('./auth');

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    Member.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //Passport register
  passport.use('local.register', new LocalStrategy({
      usernameField : 'email',
      passswordField : 'password',
      passReqToCallback : true
  },function(req, email, password, done){
    //Validator input
    req.checkBody('firstname', req.__('Input your first name')).notEmpty();
    req.checkBody('lastname', req.__('Input your last name')).notEmpty();
    req.checkBody('email', req.__('Email invalid')).notEmpty().isEmail();

    var errors = req.validationErrors();

    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
       
        return done(null,false,req.flash('error',messages))
    }

    Member.findOne({
        'local.email' : email       
    }, function(err, memmber){
        if(err){
            return done(err)
        }
        if(memmber){
            return done(null, false, {
                message : req.__('Email address used, please enter another email.')
            })
        }
        var newMember = new Member();
        newMember.info.firstname = req.body.firstname;
        newMember.local.email = email;
        newMember.local.password = newMember.encryptPassword(password);

        newMember.save(function(err, result) {
            if (err) {
                return done(err);
            } else {            
                if (settings.confirmEmail == 1) {
                    return done(null, newMember);
                } else {
                    req.logIn(newMember, function(err) {
                        provider = "local";
                        done(err, newMember);
                    });
                }
            }
        });
    })
  }));

  passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {

    req.checkBody('email', 'Địa chỉ Email không hợp lệ, vui lòng kiểm tra lại.').notEmpty().isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        console.log("qua day")
        return done(null, false, req.flash('error', messages));
    }

    
    //find user
    Member.findOne({
        'local.email': email
    }, function(err, customer) {
        if (err) {
            return done(err);
        }

        if (!customer) {
            return done(null, false, {
                message: 'Tài khoản này không tồn tại, vui lòng kiểm tra lại.'
            });
        }
        if (!customer.validPassword(password)) {
            return done(null, false, {
                message: req.__('authen.invalid_password')
            });
        }
        // if (customer.isInActivated(customer.status)) {
        //     return done(null, false, {
        //         message: 'Tài khoản của bạn chưa kích hoạt, vui lòng kích hoạt rồi đăng nhập lại.'
        //     });
        // }
        // if (customer.isSuspended(customer.status)) {
        //     return done(null, false, {
        //         message: 'Tài khoản của bạn hiện đang bị khóa, vui lòng kiểm tra lại.'
        //     });
        // }
        // provider = "local";
        return done(null, customer);
    });

}));

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: configAuth.facebookAuth.profileFields,
    passReqToCallback: true
}, function(req, token, refreshToken, profile, done) {

    // Kiem tra neu ton tai thi dang nhap
    Member.findOne({
        'facebook.id': profile.id
    }, function(err, customer) {
        if (err) {
            return done(err);
        }
        if (customer) {
            // Dang nhap tai khoan
           // provider = "facebook";
            return done(null, customer);
        } else {

            Member.findOne({
                $or: [
                    { 'local.email': profile.emails[0].value },
                    { 'google.email': profile.emails[0].value }
                ]
            }).exec(function(err, customer) {
                if (err) {
                    return done(err);
                }

                if (customer) {
                    var wh = {};
                    if (customer.local.email) {
                        wh = { 'local.email': profile.emails[0].value }
                    } else if (customer.google.email) {
                        wh = { 'google.email': profile.emails[0].value }
                    } else {
                        return done(err);
                    }

                    Member.findOneAndUpdate(wh, {
                        'facebook.id': profile.id,
                        'facebook.token': token,
                        'facebook.name': profile.name.givenName + ' ' + profile.name.familyName,
                        'facebook.email': profile.emails[0].value,
                        'facebook.photo': 'https://graph.facebook.com/v2.8/' + profile.id + '/picture?type=large'
                    }, {
                        new: true
                    }, function(err, customer) {
                        if (err) {
                            return done(err);
                        }
                        provider = "facebook";
                        return done(null, customer);
                    });

                } else {
                    //Them tai khoan moi
                    var newCustomer = new Member();
                    newCustomer.roles = "CUSTOMER";
                    newCustomer.facebook.id = profile.id;
                    newCustomer.facebook.token = token;
                    newCustomer.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newCustomer.facebook.email = profile.emails[0].value;
                    newCustomer.facebook.photo = 'https://graph.facebook.com/v2.8/' + profile.id + '/picture?type=large';
                    newCustomer.status = 'ACTIVE';
                    newCustomer.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        provider = "facebook";
                        return done(null, newCustomer);
                    });
                }
            });
        }
    });
}));