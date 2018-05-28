var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var memberController = require('../../controllers/ctr_users/memberControler');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/dang-ky',memberController.get_register);
router.post('/dang-ky', memberController.post_regsiter);

/* GET MEMBER LOGIN */
router.get('/dang-nhap',memberController.get_login);
router.post('/dang-nhap',memberController.post_login);

/* GET MEMBER LOGIN FACEBOOK */
router.get('/facebook', memberController.get_facebook_login);
router.get('/facebook/callback', memberController.get_facebook_callback_login);

module.exports = router;