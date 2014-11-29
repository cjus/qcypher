var q = require('q')

describe('HTTP 400 Test', function() {
  'use strict';
  describe('reachable database with bad query', function() {
    var QCypher = require('../lib/index')
      , qcypher = new QCypher()
      , graphDatabaseUrl = 'http://localhost:7474';
    qcypher.init(graphDatabaseUrl);
    it('should return HTTP 400', function(done) {
      qcypher.query('CATCH (n) RETURN n LIMIT 1', {})
        .then(
          function resolved(result) {
            expect(true).toBeFalse();
            done();
          },
          function rejected(result) {
            expect(result.status.httpCode).toBe('400');
            done();
          }
        );
    });
  });
});

