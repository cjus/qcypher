/**
 * qCypher
 * A q/promises based pure JS library for working with Neo4j
 *
 * @module qCypher
 * @author Carlos Justiniano
 */

var q = require('q')
  , request = require('request')
  , us = require('underscore');

function QCypher() {
  'use strict';
  var graphDatabaseUrl = 'http://localhost:7474';

  var statusCodes = {
    '200': ['OK', 'Request succeeded without error'],
    '201': ['Created', 'Resource created'],
    '400': ['Bad Request', 'Request is invalid, missing parameters?'],
    '401': ['Unauthorized', 'User isn\'t authorized to access this resource'],
    '402': ['Request Failed', 'Parameters are valid but request still failed'],
    '404': ['Not Found', 'The requested resource was not found on the server'],
    '413': ['413 Request Entity Too Large', 'The webserver or proxy believes the request is too large'],
    '429': ['Too Many Request', 'Too many requests issue within a period'],
    '500': ['Server Error', 'An error occurred on the server'],
    '501': ['Method Not Implemented', 'The requested method / resource isn\'t implemented on the server'],
    '503': ['Service Unavailable', 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. The implication is that this is a temporary condition which will be alleviated after some delay']
  };

  /**
   * mapStatus
   * @param code
   * @param statusObject
   * @returns {*}
   */
  function mapStatus(code, statusObject) {
    code = String(code);
    statusObject.statusCode = code;
    if (statusCodes[code]) {
      statusObject.httpCode = code;
      statusObject.httpMessage = statusCodes[code][0];
      statusObject.httpDescription = statusCodes[code][1];
    }
    return statusObject;
  }

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
    var deferred = q.defer()
      , reqobj = {};
    if (typeof requestObjOrString === 'string') {
      reqobj.method = 'GET';
      reqobj.url = requestObjOrString;
    } else {
      reqobj = us.extend(reqobj, requestObjOrString);
    }

    request(reqobj, function(err, result) {
      var jobj = {}
        , statusObject = {
          httpCode: 'unknown'
        };

      if (err) {
        console.log('err.code', err.code);
        if (err.code === 'ECONNREFUSED') {
          statusObject.subCode = err.code;
          err.code = '500';
        }
        statusObject = mapStatus(err.code, statusObject);
        deferred.reject({
          status: statusObject,
          error: err
        });
      } else {
        try {
          if (result.statusCode === 200 || result.statusCode === 201) {
            jobj = JSON.parse(result.body);
          }
          statusObject = mapStatus(result.statusCode, statusObject);
          jobj.status = statusObject;
          if (result.statusCode < 300) {
            deferred.resolve(jobj);
          } else {
            jobj.error = result.body;
            deferred.reject(jobj);
          }
        } catch (e) {
          statusObject = mapStatus('500', statusObject);
          console.log(statusObject);
          deferred.reject({
            status: statusObject,
            error: e
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
  function init(graphDBUrl) {
    graphDatabaseUrl = graphDBUrl;
  }

  /**
   * query
   * @return q - promise
   */
  function query(queryStatement, params) {
    var deferred = q.defer()
      , j
      , o = {
        "query": queryStatement,
        "params": params
      };

    try {
      j = JSON.stringify(o);
      qrequest({
        'headers': {'content-type': 'application/json'},
        'method': 'POST',
        'url': graphDatabaseUrl + '/db/data/cypher',
        'body': j
      })
        .then(
        function resolve(result) {
          deferred.resolve(result);
        },
        function reject(result) {
          deferred.reject(result);
        }
      );
    } catch (e) {
      var statusObject = {};
      mapStatus('400', statusObject);
      deferred.reject({
        status: statusObject
      });
    }
    return deferred.promise;
  }

  /**
   * transBegin
   * Creates a transaction object which can be used with transExecute, transRollback and transCommit
   * For use with: http://docs.neo4j.org/chunked/milestone/rest-api-transactional.html
   * @return transObject {object} - object used to work with an open transaction
   */
  function transCreate() {
    return {
      commitUrl: graphDatabaseUrl + '/db/data/transaction'
    };
  }

  /**
   * transExecute
   * Execute one or more statements against an open transaction
   * @param transObject {object} - object used to work with an open transaction
   * @param statements {array} - array containing one or more statements
   */
  function transExecute(transObject, statements) {
    var deferred = q.defer()
      , j
      , o = {
        "statements": statements
      };

    try {
      j = JSON.stringify(o);
      qrequest({
        'headers': {'content-type': 'application/json'},
        'method': 'POST',
        'url': transObject.commitUrl,
        'body': j
      })
        .then(
        function resolved(result) {
          console.log('result', result);
          transObject.commitUrl = result.commit;
          if (result.transaction) {
            transObject.expires = result.transaction.expires;
          }
          deferred.resolve({
            results: result.results,
            errors: result.errors
          });
        },
        function reject(result) {
          console.log('rejected', result);
          deferred.reject(result);
        }
      );
    } catch (e) {
      var statusObject = {};
      mapStatus('400', statusObject);
      deferred.reject({
        status: statusObject
      });
    }

    return deferred.promise;
  }

  /**
   * transResetTimeout
   * @param transObject
   * @returns {promise|*|Q.promise}
   */
  function transResetTimeout(transObject) {
    var deferred = q.defer()
      , j
      , o = {
        "statements": []
      };

    try {
      j = JSON.stringify(o);
      qrequest({
        'headers': {'content-type': 'application/json'},
        'method': 'POST',
        'url': transObject.commitUrl.replace('/commit', ''),
        'body': j
      })
        .then(function resolve(result) {
          if (result.transaction) {
            transObject.expires = result.transaction.expires;
          }
          deferred.resolve({
            results: result.results,
            errors: result.errors
          });
        }, function reject(result) {
          deferred.reject(result);
        });
    } catch (e) {
      var statusObject = {};
      mapStatus('400', statusObject);
      deferred.reject({
        status: statusObject
      });
    }

    return deferred.promise;
  }

  /**
   * transRollback
   */
  function transRollback(transObject) {
    return qrequest({
      'headers': {'content-type': 'application/json'},
      'method': 'DELETE',
      'url': transObject.commitUrl.replace('/commit', '')
    });
  }

  /**
   * transCommit
   * Commits an open transaction
   * @param transObject
   */
  function transCommit(transObject) {
    return qrequest({
      'headers': {'content-type': 'application/json'},
      'method': 'POST',
      'url': transObject.commitUrl
    });
  }

  // expose public functions
  return {
    init: init,
    query: query,
    transCreate: transCreate,
    transExecute: transExecute,
    transResetTimeout: transResetTimeout,
    transCommit: transCommit,
    transRollback: transRollback
  };
}

module.exports = QCypher;
