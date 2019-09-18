const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
  userId:String,
  message:String,
  date:{
    type:Date,
    default:Date.now
  }
})

module.exports = mongoose.model('Message',msgSchema);