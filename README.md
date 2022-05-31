# @clocklimited/save-mongodb - mongodb persistence engine for **save**

[![CircleCI](https://circleci.com/gh/clocklimited/save-mongodb/tree/master.svg?style=svg)](https://circleci.com/gh/clocklimited/save-mongodb/tree/master)

## Installation

```
npm install @clocklimited/save-mongodb

// There is a peer dependency of mongodb - you have to bring your own!
npm install mongodb@^4
```

## Usage

If you want to see how this works look at the tests or this simple example:

```js
var MongoClient = require('mongodb').MongoClient // npm install mongodb
var save = require('save') // npm install save
var saveMongodb = require('@clocklimited/save-mongodb')

// connect to your mongodb database.
MongoClient.connect('mongodb://localhost:27017/', function(error, client) {
  if (error) return console.error(error.message)
  var connection = client.db('test')
  // Get a collection. This will create the collection if it doesn't exist.
  connection.collection('contact', function(error, collection) {
    if (error) return console.error(error.message)

    // Create a save object and pass in a mongodb engine.
    var contactStore = save('Contact', { engine: saveMongodb(collection) })

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

var contactStore = save('Contact', { engine: saveMongodb(collection) })
var es = require('event-stream')

contactStore.find({})
  .pipe(es.stringify())
  .pipe(process.stdout)

```

## Credits

[Paul Serby](https://github.com/serby/) follow me on twitter [@serby](http://twitter.com/serby)
[Clock Limited](https://github.com/clocklimited/) follow us on twitter [@clock](http://twitter.com/clock)

## Licence

Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
