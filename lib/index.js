/**
 * qCypher
 * A q/promises based pure JS library for working with Neo4j
 *
 * @module qCypher
 * @author Carlos Justiniano
 */
var q = require('q')
  , request = require('request')
  , us = require('underscore')
  , graphDatabaseUrl = 'http://localhost:7474';

var statusCodes = {
  '200': ['OK', 'Request succeeded without error'],
  '400': ['Bad Request', 'Request is invalid, missing parameters?'],
  '401': ['Unauthorized', 'User isn\'t authorized to access this resource'],
  '402': ['Request Failed', 'Parameters are valid but request still failed'],
  '404': ['Not Found', 'The requested resource was not found on the server'],
  '429': ['Too Many Request', 'Too many requests issue within a period'],
  '500': ['Server Error', 'An error occurred on the server'],
  '501': ['Method Not Implemented', 'The requested method / resource isn\'t implemented on the server'],
  '503': ['Service Unavailable', 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. The implication is that this is a temporary condition which will be alleviated after some delay']
};


/**
 * qrequest
 * @param requestObjOrString {object|string} request compatible object or string URL
 * @return {object} Q promise
 * @notes
 * For HTTP GET use the following:
 * {
 *   method: 'GET',
 *   url: 'http://localhost:8000/api/v1/profile/user/7b894b79-8c8e-418e-8a85-e73dd60d52eb'
 * }
 *
 * When performing a GET operation "method: 'GET'" isn't required as it's the default.
 * So you could use:
 *
 * {
 *   method: 'GET',
 *   url: 'http://localhost:8000/api/v1/profile/user/7b894b79-8c8e-418e-8a85-e73dd60d52eb'
 * }
 *
 * There is a shortcut for HTTP GET requests. Just pass a string url instead of a request object:
 *
 * qrequest('http://localhost:8000/api/v1/profile/user/7b894b79-8c8e-418e-8a85-e73dd60d52eb')
 *
 * For HTTP POST use this format:
 * {
 *   method: 'POST',
 *   url: 'http://localhost:8000/api/v1/profile/user/7b894b79-8c8e-418e-8a85-e73dd60d52eb'
 *   body: {'a':'12'}
 * }
 */
function qrequest(requestObjOrString) {
  'use strict';
  var deferred = q.defer()
    , reqobj = {};
  if (typeof requestObjOrString === 'string') {
    reqobj.method = 'GET';
    reqobj.url = requestObjOrString;
  } else {
    reqobj = us.extend(reqobj, requestObjOrString);
  }

  function mapStatus(code, statusObject) {
    code = String(code);
    if (statusCodes[code]) {
      statusObject.httpCode = code;
      statusObject.httpMessage = statusCodes[code][0];
      statusObject.httpDescription = statusCodes[code][1];
    } else {
      statusObject.statusCode = code;
    }
    return statusObject;
  }

  request(reqobj, function(err, result) {
    var jobj
      , statusObject = {
        httpCode: 'unknown'
      };

    if (err) {
      statusObject = mapStatus(err.code, statusObject);
      console.log('err', JSON.stringify(err));
      deferred.reject(statusObject);
    } else {
      try {
        jobj = JSON.parse(result.body);
        statusObject = mapStatus(result.statusCode, statusObject);
        jobj.status = statusObject;
        console.log('jobj', jobj);
        deferred.resolve(jobj);
      } catch (e) {
        statusObject = mapStatus('500', statusObject);
        console.log(statusObject);
        deferred.reject({
          status: statusObject
        });
      }
    }
  });
  return deferred.promise;
}

/**
 * Initialize module
 *
 * @public
 * @method init
 * @param graphDBUrl {string} path to Neo4j Graph Database
 */
exports.init = function(graphDBUrl) {
  'use strict';
  graphDatabaseUrl = graphDBUrl;
};

/**
 * query
 * @return q - promise
 */
exports.query = function(query, params) {
  'use strict';
  var deferred = q.defer()
    , j
    , o = {
      "query": query,
      "params": params
    };

  try {
    j = JSON.stringify(o);
  } catch (e) {
    throw e;
  }

  qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'POST',
    'url': graphDatabaseUrl + '/db/data/cypher',
    'body': j
  })
    .then(function(result) {
      if (result.message) {
        deferred.reject(result);
      } else {
        deferred.resolve(result);
      }
    })
    .fail(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};


/**********************************************************************************************************
 * transBegin     - Begin a new transaction
 * transExecute   - Execute against an open transaction
 * transRollback  - Rollback an open transaction
 * transCommit    - Commit and open transaction
 */


/**
 * transBegin
 * Creates a transaction object which can be used with transExecute, transRollback and transCommit
 * For use with: http://docs.neo4j.org/chunked/milestone/rest-api-transactional.html
 * @return transObject {object} - object used to work with an open transaction
 */
exports.transCreate = function() {
  'use strict';
  return {
    commitUrl: graphDatabaseUrl + '/db/data/transaction'
  };
};

/**
 * transExecute
 * Execute one or more statements against an open transaction
 * @param transObject {object} - object used to work with an open transaction
 * @param statements {array} - array containing one or more statements
 */
exports.transExecute = function(transObject, statements) {
  'use strict';
  var deferred = q.defer();

  qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'POST',
    'url': transObject.commitUrl,
    'body': {
      "statements": statements
    }
  })
    .then(function(result) {
      transObject.commitUrl = result.commit;
      transObject.expires = result.transaction.expires;
      deferred.resolve({
        results: result.results,
        errors: result.errors
      });
    })
    .fail(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};


/**
 * transResetTimeout
 * @param transObject
 * @returns {promise|*|Q.promise}
 */
exports.transResetTimeout = function(transObject) {
  'use strict';
  var deferred = q.defer();

  qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'POST',
    'url': transObject.commitUrl,
    'body': {
      "statements": []
    }
  })
    .then(function(result) {
      transObject.commitUrl = result.commit;
      transObject.expires = result.transaction.expires;
      deferred.resolve({
        results: result.results,
        errors: result.errors
      });
    })
    .fail(function(err) {
      deferred.reject(err);
    });
  return deferred.promise;
};

/**
 * transRollback
 */
exports.transRollback = function(transObject) {
  'use strict';
  return qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'DELETE',
    'url': transObject.commitUrl,
    'body': {}
  });
};

/**
 * transCommit
 * Commits an open transaction
 * @param transObject
 */
exports.transCommit = function(transObject) {
  'use strict';
  return qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'POST',
    'url': transObject.commitUrl,
    'body': {}
  });
};

