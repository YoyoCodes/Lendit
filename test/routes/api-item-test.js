const {assert} = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Item = require('../../models/item');
const User = require('../../models/user');
const {
  createUser,
  createItem,
  logUserIn,
  signUserUp
} = require('../helper');

describe('Server path /api/items', () => {

  beforeEach(async () => {
    await mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_Password}@ds247001.mlab.com:47101/lendit-test`);
    await mongoose.connection.db.dropDatabase();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('GET', () => {
    it('returns single item as JSON array', async () => {
      const item = await createItem('Scissors');

      const response = await request(app)
        .get('/api/items')
      const itemReceivedBack = JSON.parse(response.text)[0].itemName;

      assert.equal(itemReceivedBack, item.itemName)
    });
    it('returns multiple items as JSON array', async () => {
      const item1 = await createItem('Tennis Balls');
      const item2 = await createItem('Ostrich Egg');

      const response = await request(app)
        .get('/api/items')
      const responseJson = JSON.parse(response.text);

      assert.equal(responseJson[0].itemName, item2.itemName)
      assert.equal(responseJson[1].itemName, item1.itemName)
    });
  });
  describe('POST', () => {
    it('adds an item to the database', async () => {
      const itemToCreate = { itemName: "Scissors" };

      const response = await request(app)
        .post('/api/items')
        .type('form')
        .send(itemToCreate)

      const databaseResponse = await Item.find();
      const itemInDatabase = databaseResponse[0].itemName

      assert.equal(itemInDatabase, itemToCreate.itemName);
    });
    it('can create an item with a description', async () => {
      const itemToCreate = { itemName: 'Scissors', itemDescription: 'This is the description of the item' };

      const response = await request(app)
        .post('/api/items')
        .type('form')
        .send(itemToCreate)

      const databaseResponse = await Item.find();

      assert.equal(databaseResponse[0].itemDescription, 'This is the description of the item');
    });
    it('assigns the item to a user', async () => {
      const signedUpUser = await signUserUp({ "firstName": "Chris" });
      const loggedInUser = await logUserIn({ "firstName": "Chris" });
      const loggedInUserId = JSON.parse(signedUpUser.text)._id;
      const itemToCreate = {itemName: 'Peanut Butter', owner: loggedInUserId};

      const createItemHttpResponse = await request(app)
        .post('/api/items')
        .type('form')
        .send(itemToCreate);

      const item = await Item.findOne({itemName: 'Peanut Butter'})
      assert.equal(item.owner._id, loggedInUserId);
    });
  });
  describe('DELETE', () => {
    it('removes the item from the database', async () => {
      const item = new Item({ itemName: 'Scissors' });
      await item.save();

      const response = await request(app)
        .delete('/api/items')
        .send({_id: item._id});

      const databaseResponse = await Item.find();

      assert.equal(databaseResponse[0], undefined);
    });
  });
  describe('/:item_id', () => {
    describe('PUT', () => {
      it('updates the current borrower of the item', async () => {
        const borrower = await createUser({ firstName: 'Borrower'});
        const owner = await createUser({ firstName: 'Owner'});
        const loggedInUser = await logUserIn(borrower);
        const newItem = await createItem('Kettle', owner)

        const borrowResponse = await request(app)
          .put(`/api/items/${newItem._id}`)
          .send({ borrowerId: borrower._id });
        const updatedItem = await Item.findOne( {itemName: 'Kettle'} )

        assert.deepEqual(updatedItem.currentBorrower, borrower._id);
        assert.equal(borrowResponse.status, 200);
      });
      it('gives the owner of the item a karma point', async () => {
        const borrower = await createUser({ firstName: 'Borrower'})
        const owner = await createUser({ firstName: 'Owner'})
        const newItem = await createItem('Kettle', owner)
        const borrowerLogsIn = await logUserIn(borrower);

        const ownerPostsItemResponse = await request(app)
          .put(`/api/items/${newItem._id}`)
          .send({ borrowerId: borrower._id });
        const itemOwner = await User.findOne({ _id: newItem.owner._id })

        assert.equal(itemOwner.karmaPoints, 11);
        assert.equal(ownerPostsItemResponse.status, 200);
      });
    });
  });
});
