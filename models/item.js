const mongoose = require('mongoose'), Schema = mongoose.Schema;
const User = require('../models/user.js');

const ItemSchema = new mongoose.Schema({
  itemName: {
    type: String
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  itemDescription: {
    type: String
  },
  owner: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  image: {
    type: String,
    default: "default",
  }
});

var Item = mongoose.model('Item', ItemSchema);

Item.findAllAndReverse = function() {
  return Item.find().sort({dateAdded:-1})
}

module.exports = Item;
