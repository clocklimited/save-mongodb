# Changelog

## v4.0.0

 - There is now a breaking peer dependency change of `mongodb` version 4. This comes with a minimum MongoDB server version of 3.6.
 - There is no longer support guaranteed for NodeJS versions below 12. If you require this, please stick with the v3.0.1 version.
 - The `idType` property was previously an instance of `ObjectID` but is now `ObjectId`. This is not a functional change, but you may experience issues if comparing types or using `instanceof`.

