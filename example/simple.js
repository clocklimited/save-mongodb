var MongoClient = require('mongodb').MongoClient // npm install mongodb
var save = require('save') // npm install save
var saveMongodb = require('..')

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
