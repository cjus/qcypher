var q = require('q')

describe('HTTP 404 Test', function() {
  'use strict';
  describe('reachable database with REST path', function() {
    var QCypher = require('../lib/index')
      , qcypher = new QCypher()
      , graphDatabaseUrl = 'http://localhost:7474/doesnotexist';
    qcypher.init(graphDatabaseUrl);
    it('should return HTTP 404', function(done) {
      qcypher.query('MATCH (n) RETURN n LIMIT 1', {})
        .then(
        function resolved(result) {
          expect(true).toBeFalse();
          done();
        },
        function rejected(result) {
          expect(result.status.httpCode).toBe('404');
          done();
        }
      );
    });
  });
});

