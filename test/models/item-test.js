const Item = require('../../models/item');
const {assert} = require('chai');
const mongoose = require('mongoose');
const User = require('../../models/user');
const sinon = require('sinon');

describe('Item', () => {

  beforeEach(async () => {
    await mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_Password}@ds247001.mlab.com:47101/lendit-test`);
    await mongoose.connection.db.dropDatabase();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('#save', () => {
    it('it persists', async () => {
      const exampleItem = {
        itemName: 'Scissors'
      };

      const item = new Item(exampleItem);
      await item.save();
      const databaseResponse = await Item.find();

      assert.equal(databaseResponse[0].itemName, exampleItem.itemName);
    });
    it('can have a string description', async () => {
      const itemDescriptionPath = Item.schema.paths.itemDescription.instance

      assert.equal(typeof itemDescriptionPath, 'string')
    });
    it('starts with no current borrower ', async () => {
      const exampleItem = {
        itemName: 'Scissors',
        itemDescription: 'This is the description of the item'
      };

      const item = new Item(exampleItem);
      const defaultValue = Item.schema.paths.currentBorrower.defaultValue

      assert.equal(defaultValue, undefined);
    });
  });
  describe('When returning items', async () => {
    it('returns them in reverse-chronological order', async () => {
      const item1 = new Item({itemName: 'Ostrich Egg', dateAdded: '2018-07-25T16:49:16.515Z'});
      const item2 = new Item({itemName: 'Tennis ball', dateAdded: '2017-07-24T16:49:16.515Z'});
      const item3 = new Item({itemName: 'Pet food', dateAdded: '2016-07-23T16:49:16.515Z'});
      await item1.save();
      await item2.save();
      await item3.save();

      const databaseResponse = await Item.findAllAndReverse();

      assert.equal(databaseResponse[0].itemName, item1.itemName);
      assert.equal(databaseResponse[1].itemName, item2.itemName);
      assert.equal(databaseResponse[2].itemName, item3.itemName);
    });
  });
  describe('#updateBorrower', () => {
    it('changes the currentBorrower to the new borrower', async () => {
      const spy = sinon.spy(Item, 'findByIdAndUpdate')
      const itemMock = {
        itemName: 'Toaster',
        id: '1'
      }
      const userMock = {
        'firstName': "Rob",
        'lastName': "Faldo",
        'email': "robertfaldo@gmail.com",
        'username': "rfaldo",
        'password': "validpassword123",
        '_id': '001'
      }

      Item.updateBorrower(itemMock._id, userMock._id);

      assert.equal(spy.calledOnce, true)
    });
  });
});
