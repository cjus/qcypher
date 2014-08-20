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
  , graphDatabaseUrl = '';

//var graphDatabaseUrl = (process.env.GRAPHENEDB_URL) ? process.env.GRAPHENEDB_URL : CONFIG.graphDatabaseURL;

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
  request(reqobj, function(err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(JSON.parse(result.body));
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
  var o = {
    "query": query,
    "params": params
  };
  return qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'POST',
    'url': graphDatabaseUrl + '/db/data/cypher',
    'body': JSON.stringify(o)
  });
};

/**
 * batchCreate
 * Creates a query object which can be used in batchQueryAppend and batchQueryExectute
 * For use with: http://docs.neo4j.org/chunked/milestone/rest-api-transactional.html
 * @return queryListObject {object} - object used to aggregate batch queries
 */
exports.batchCreate = function() {
  'use strict';
  return {
    "statements": []
  };
};

/**
 * batchAppend
 * @param queryListObject {object} - object used to aggregate batch queries
 * @param query {string} - Cypher query
 * @param params {string, object} - Query params
 * @return queryListObject
 */
exports.batchAppend = function(queryListObject, query, params) {
  'use strict';
  var o = {
    "statement": query,
    "resultDataContents": [ "row", "graph" ]
  };
  if (params) {
    o.parameters = params;
  }
  queryListObject.statements.push(o);
  return queryListObject;
};

/**
 * batchExecute
 * @return q - promise
 */
exports.batchExecute = function(queryListObject) {
  'use strict';
  return qrequest({
    'headers': {'content-type': 'application/json'},
    'method': 'POST',
    'url': graphDatabaseUrl + '/db/data/transaction/commit',
    'body': JSON.stringify(queryListObject)
  });
};

/**
 * batchTestForErrors
 * @param results {string | object} results from batchQueryExecute promise
 * @returns {boolean}
 */
exports.batchTestForErrors = function(results) {
  'use strict';
  var o
    , hasErrors = false;
  if (typeof results === 'string') {
    o = JSON.parse(results);
  } else {
    o = results;
  }
  if (o.errors.length > 0) {
    hasErrors = true;
  }
  return hasErrors;
};

/**
 * batchGetErrors - returns errors array from batchQueryExecute promise
 * @param results
 * @returns {array} - errors array
 */
exports.batchGetErrors = function(results) {
  'use strict';
  var o;
  try {
    if (typeof results === 'string') {
      o = JSON.parse(results);
    } else {
      o = results;
    }
    return o.errors;
  } catch (err) {
    return err;
  }
};
