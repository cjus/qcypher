var qcypher = require('../lib/index')
  , q = require('q');

jasmine.getEnv().defaultTimeoutInterval = 2000;

describe('#Simple Query Suite', function() {
  'use strict';

  beforeEach(function(done) {
    var graphDatabaseUrl = (process.env.GRAPHENEDB_URL) ? process.env.GRAPHENEDB_URL : 'http://localhost:7474';
    qcypher.init(graphDatabaseUrl);
    done();
  });

  describe('Connect to neo4j', function() {

    it('create node should return node', function(done) {
      qcypher.query('MERGE (n:QCypher {name: "first"}) RETURN n', {})
        .then(function(result) {
          var data = result.data[0][0].data;
          expect(data.name).toBe('first');
          done();
        });
    });

  });
});

