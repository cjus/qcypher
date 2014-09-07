var qcypher = require('../lib/index')
  , q = require('q');

describe('#Simple Query Suite', function() {
  'use strict';

  var graphDatabaseUrl = process.env.GRAPHENEDB_URL || 'http://localhost:7474';
  qcypher.init(graphDatabaseUrl);

  describe('Clear database', function() {
    it('should succeed', function(done) {
      qcypher.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r', {})
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

  describe('Connect to neo4j', function() {
    it('create node should return node', function(done) {
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

  describe('Invalid query', function() {
    it('should fail', function(done) {
      qcypher.query('MERGE (n:QCypher name: "first") RETURN n', {})
        .then(function(result) {
          expect(false).toBeTrue(); // this should not happen
          done();
        })
        .catch(function(error) {
          expect(error.exception).toBeDefined();
          done();
        });
    });
  });

});

