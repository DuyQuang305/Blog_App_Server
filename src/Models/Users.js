const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Users = new Schema({
        username: { type: String, min: 3, max: 20, unique:true },
        email: { type: String, required: true, max: 50, unique:true},
        password: { type: String, min: 8 },
        address: { type: String, default: ""},
        interest: { type: String, default: ""},
        avatarImage: { type: String, default: ""},
        authGoogleId: {
          type: String,
          default: null
        },
        authFacebookId: {
          type: String,
          default: null
        },
        authType: {
          type: String,
          enum: ['local', 'google', 'facebook'],
          default: 'local'
        },
        isVerified:{type: Boolean}
      });

module.exports = mongoose.model('Users', Users);