module.exports = init

var ObjectId = require('mongodb').ObjectId

function init(property) {
  return castIdProperty

  function castIdProperty(query) {
    var newQuery = Object.assign({}, query)
    var idQuery = query[property]
    // only convert if id is present
    if (!idQuery) {
      return newQuery
    }

    if (Object(idQuery) === idQuery) {
      newQuery[property] = castComplexId(idQuery)
    } else {
      newQuery[property] = ObjectId.isValid(newQuery[property])
        ? new ObjectId(newQuery[property])
        : newQuery[property]
    }

    return newQuery
  }

  function castComplexId(query) {
    var newQuery = Object.assign({}, query)

    Object.keys(newQuery).map(function(key) {
      var value = newQuery[key]
      if (Array.isArray(value)) {
        newQuery[key] = value.map(function(item) {
          return ObjectId.isValid(item) ? new ObjectId(item) : item
        })
      } else {
        newQuery[key] = ObjectId.isValid(value) ? new ObjectId(value) : value
      }
    })

    return newQuery
  }
}
