var qcypher = require('../lib/index')
  , q = require('q');

describe('#Localhost Test', function() {
  'use strict';

//  var graphDatabaseUrl = process.env.GRAPHENEDB_URL || 'http://localhost:7474';
//  qcypher.init(graphDatabaseUrl);

  describe('Not initializing qcypher', function() {
    it('should still succeed', function(done) {
      qcypher.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r', {})
        .then(function(result) {
          expect(result).toBeDefined();
          done();
        })
        .catch(function(result) {
          console.log('result', result);
          done();
        });
      qcypher.query('MERGE (n:QCypher {name: "first"}) RETURN n', {})
        .then(function(result) {
          var data = result.data[0][0].data;
          expect(data.name).toBe('first');
          done();
        })
        .catch(function(result) {
          console.log('result', result);
          done();
        });
    });
  });
});
