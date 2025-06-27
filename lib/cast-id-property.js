const ObjectId = require('mongodb').ObjectId

const init = property => query => {
  let newQuery = Object.assign({}, query)
  const idQuery = query[property]

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

const castComplexId = query => {
  const newQuery = Object.assign({}, query)

  Object.keys(newQuery).map(function(key) {
    const value = newQuery[key]
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

module.exports = init
