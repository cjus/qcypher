var qcypher = require('../lib/index')
  , q = require('q');

describe('#Localhost Test', function() {
  'use strict';

  describe('unreachable database', function() {
    var graphDatabaseUrl = 'http://localhost:65555';
    //var graphDatabaseUrl = 'http://localhost:7474';
    qcypher.init(graphDatabaseUrl);

    it('should return HTTP error', function(done) {
      qcypher.query('MATCH (n) RETURN n LIMIT 1', {})
        .then(function(result) {
          expect(result).toBeDefined();
          done();
        })
        .catch(function(result) {
          console.log('result', result);
          done();
        });
    });
  });
});

