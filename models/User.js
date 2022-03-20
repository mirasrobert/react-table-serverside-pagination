const mongoose = require('mongoose');

const AddressSchema = mongoose.Schema({
  house_no: {
    type: Number,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: [AddressSchema],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
