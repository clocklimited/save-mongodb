# @clocklimited/save-mongodb - mongodb persistence engine for **save**

## Installation

```
npm install @clocklimited/save-mongodb

// There is a peer dependency of mongodb - you have to bring your own!
npm install mongodb@^8
```

## Usage

Version >=5 is compatible with MongoDB 8.

If you want to see how this works look at the tests or this simple example:

```js
const MongoClient = require('mongodb').MongoClient // npm install mongodb
const save = require('save') // npm install save
const saveMongodb = require('@clocklimited/save-mongodb')

// connect to your mongodb database.
MongoClient.connect('mongodb://localhost:27017/', function(error, client) {
  if (error) return console.error(error.message)
  const connection = client.db('test')
  // Get a collection. This will create the collection if it doesn't exist.
  connection.collection('contact', function(error, collection) {
    if (error) return console.error(error.message)

    // Create a save object and pass in a mongodb engine.
    const contactStore = save('Contact', { engine: saveMongodb(collection) })

    // Then we can create a new object.
    contactStore.create({ name: 'Paul', email: 'paul@serby.net' }, function(
      error,
      contact
    ) {
      if (error) return console.error(error.message)

      // The created 'contact' is returned and has been given an _id
      console.log(contact)

      // Don't forget to close your database connection!
      client.close()
    })
  })
})
```

### Streaming find()

Find now has a streaming interface

```js

const contactStore = save('Contact', { engine: saveMongodb(collection) })
const es = require('event-stream')

contactStore.find({})
  .pipe(es.stringify())
  .pipe(process.stdout)

```

## Credits

[Paul Serby](https://github.com/serby/) follow me on twitter [@serby](http://twitter.com/serby)
[Clock Limited](https://github.com/clocklimited/) follow us on twitter [@clock](http://twitter.com/clock)

## Licence

Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
