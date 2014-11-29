var q = require('q')

describe('HTTP 500 Test', function() {
  'use strict';

  describe('unreachable database', function() {
    var QCypher = require('../lib/index')
      , qcypher = new QCypher()
      , graphDatabaseUrl = 'http://localhost:65555';
    qcypher.init(graphDatabaseUrl);
    it('should return HTTP 500', function(done) {
      qcypher.query('MATCH (n) RETURN n LIMIT 1', {})
        .then(
          function resolved(result) {
            expect(true).toBeFalse();
            done();
          },
          function rejected(result) {
            expect(result.status.httpCode).toBe('500');
            expect(result.status.subCode).toBe('ECONNREFUSED');
            done();
          }
        );
    });
  });

});

