var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
    info: {
        firstname: String,
        lastname: String,
        telephone: String,
        fax: String
    },
    newsletter: Boolean,
    roles: String, //ADMIN, CUSTOMER, VIP
    local: {
        email: {
            type: String
        },
        password: {
            type: String
        }
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        photo: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        photo: String
    },
    status: String, //ACTIVE, INACTIVE, SUSPENDED
    last_login_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

customerSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
customerSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('Customer', customerSchema);