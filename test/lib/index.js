import express from 'express';
import MongoInMemory from 'mongo-in-memory';
import ModelFactory from '../../index';

const ParseServer = require('parse-server').ParseServer;

const modelProperties = {
  defaultIncludes: ['prop1', 'prop2'],
};

const objectProperties = {
  toStringCustom() {
    const prop = this.get('prop');
    return `Your prop is ${prop}`;
  },
};
const TestObject = ModelFactory.generate('TestObject', modelProperties, objectProperties);

module.exports = () => {
  const createServer = async () => {
    const app = express();
    const port = 8000;
    const mongoServerInstance = new MongoInMemory(port); // DEFAULT PORT is 27017
    await mongoServerInstance.start();
    const mongouri = mongoServerInstance.getMongouri('myDatabaseName');
    const api = new ParseServer({
      databaseURI: mongouri,
      appId: 'myAppId',
      masterKey: 'myMasterKey',
      javascriptKey: 'javascriptKey',
      fileKey: 'optionalFileKey',
      restAPIKey: 'java',
      serverURL: 'http://localhost:1337/parse',
    });
    app.use('/parse', api);

    app.get('/find', async (req, res) => {
      try {
        const testObjects = await TestObject._find(TestObject._query());

        if (testObjects) {
          res.status(200).send();
        } else {
          throw new Error("Couldn't find the objects");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/get', async (req, res) => {
      try {
        const query = TestObject._query();

        const testObject = await TestObject._first(query);
        const testRegularObject = await TestObject._firstRegular(query);

        if (testObject && testRegularObject) {
          const findTestObjects = await TestObject._get(query, testObject.id);
          const findTestRegularObjects =
            await TestObject._getRegular(query, testRegularObject.id);

          if (findTestObjects && findTestRegularObjects
            && findTestRegularObjects.id !== findTestObjects.id) {
            res.status(200).send();
          } else {
            throw new Error("Couldn't find different the object");
          }
        } else {
          throw new Error("Couldn't find the objects");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/count', async (req, res) => {
      try {
        const query = TestObject._query();

        const testObjects = await TestObject._count(query);
        const testRegularObjects = await TestObject._countRegular(query);

        if (testObjects > 0 && testRegularObjects > 0) {
          res.status(200).send();
        } else {
          throw new Error("Couldn't count the objects");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/first', async (req, res) => {
      try {
        const query = TestObject._query();

        const testObjects = await TestObject._first(query);
        const testRegularObjects = await TestObject._firstRegular(query);
        if (testObjects && testRegularObjects && testRegularObjects.id !== testObjects.id) {
          res.status(200).send();
        } else {
          throw new Error("Couldn't get the first object");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/save', async (req, res) => {
      try {
        const testObject = new TestObject();
        testObject.set('prop', new Date());
        testObject.setAcl(false, 'public', false, false);

        const testRegularObject = new TestObject();
        testRegularObject.set('prop', new Date());
        testRegularObject.setAcl(false, 'public', true, true);

        const testObjects = await TestObject.save(testObject);
        const testRegularObjects = await TestObject.save(testRegularObject);


        if (testObjects && testRegularObjects && testRegularObjects.id !== testObjects.id) {
          res.status(200).send();
        } else {
          throw new Error("Couldn't save object");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/saveAll', async (req, res) => {
      try {
        const object1 = new TestObject();
        object1.set('prop', new Date());
        const object2 = new TestObject();
        object2.set('prop', new Date());
        const testObjects = await TestObject.saveAll([object1, object2]);
        if (testObjects) {
          res.status(200).send();
        } else {
          throw new Error("Couldn't save all the object");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/destroy', async (req, res) => {
      try {
        const testObject = await TestObject._first(TestObject._query());
        if (testObject) {
          await TestObject.destroy(testObject);
          res.status(200).send();
        } else {
          throw new Error("Couldn't destroy the object");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    app.get('/destroyAll', async (req, res) => {
      try {
        const testObjects = await TestObject._find(TestObject._query());
        if (testObjects) {
          await TestObject.destroyAll(testObjects);
          res.status(200).send();
        } else {
          throw new Error("Couldn't destroy all the object");
        }
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    return app.listen(1337);
  };

  return createServer();
};
