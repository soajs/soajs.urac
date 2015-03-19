'use strict';
/**
* hasher is responsible on hashing password
*
* @module soajs.urac
* @main
* @author: Team SOAJS
* @description: hasher responsible for hashing sensitive information such as password
*/

var bcrypt = require('bcrypt');

/**
* This is the constructor
*
* @class hasher
* @constructor
* @param config {Object} Config object
*/
var hasher = function(config) {
    this.config = config;
};
/**
 * Hashes a give text asynchronously. Returns the result in the callback.
 *
 * @class hasher
 * @method hashAsynch
 * @async
 * @param plainText {String} Text to hash
 * @param cb {Function} Callback to execute. Takes 2 arguments : error, and hash result
 */
hasher.prototype.hashAsync = function(plainText, cb) {
    bcrypt.genSalt(this.config.hashIterations, this.config.seedLength, function(err, salt) {
        if(err) return cb(err);
        bcrypt.hash(plainText, salt, cb);
    });
};
/**
 * Hashes a given text synchronously and returns the result.
 *
 * @method hash
 * @param plainText {String} Text to hash
 * @return Hash result
 */
hasher.prototype.hashSync = function(plainText) {
    var salt = bcrypt.genSaltSync(this.config.hashIterations, this.config.seedLength);
    return bcrypt.hashSync(plainText, salt);
};
/**
 * Compares plain text to a given hash. Returns the result in the callback.
 *
 * @method compare
 * @async
 * @param plainText {String} Plain text that should be compared to hash
 * @param hashText {String} Hash to check against
 * @param cb {Function} Callback to execute. Takes 2 arguments : error, and boolean result of comparison
 */
hasher.prototype.compare = function(plainText, hashText, cb) {
    return bcrypt.compare(plainText, hashText, cb);
};

module.exports = hasher;