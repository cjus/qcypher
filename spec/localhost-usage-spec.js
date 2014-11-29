var q = require('q')
  , QCypher = require('../lib/index')
  , qcypher = new QCypher();

describe('Localhost Test', function() {
  'use strict';

  describe('Not initializing qcypher', function() {
    it('should still succeed', function(done) {
      qcypher.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r', {})
        .then(function resolved(result) {
          expect(result).toBeDefined();
          done();
        }, function rejected(result) {
          done();
        });
      qcypher.query('MERGE (n:QCypher {name: "first"}) RETURN n', {})
        .then(function resolved(result) {
          var data = result.data[0][0].data;
          expect(data.name).toBe('first');
          done();
        }, function rejected(result) {
          done();
        });
    });
  });
});

