const assert = require('assert')
const { ObjectId } = require('mongodb')
const castIdProperty = require('../lib/cast-id-property')

describe('cast-id-property', function() {
  it('should return original query if idProperty doesnt exist in query', function() {
    const query = { a: 'something' }
    const result = castIdProperty('_id')(query)
    assert.deepStrictEqual(result, query)
  })

  it('should return cast property if single value provided', function() {
    const objectId = new ObjectId()
    const query = { _id: objectId.toString() }
    const result = castIdProperty('_id')(query)
    assert.deepStrictEqual(result, { _id: objectId })
  })

  it('should return string if single string value provided', function() {
    const stringA = 'something'
    const query = { _id: { $neq: stringA } }
    const result = castIdProperty('_id')(query)
    assert.deepStrictEqual(result, query)
  })

  it('should return cast object if object provided', function() {
    const objectA = new ObjectId()
    const objectB = new ObjectId()
    const query = { _id: { $in: [objectA.toString(), objectB.toString()] } }
    const result = castIdProperty('_id')(query)
    assert.deepStrictEqual(result, { _id: { $in: [objectA, objectB] } })
  })

  it('should cast only object if mixture is provided', function() {
    const objectA = new ObjectId()
    const objectB = new ObjectId()
    const stringA = 'something'
    const query = {
      _id: { $in: [objectA.toString(), stringA, objectB.toString()] }
    }
    const result = castIdProperty('_id')(query)
    assert.deepStrictEqual(result, {
      _id: { $in: [objectA, stringA, objectB] }
    })
  })
})
