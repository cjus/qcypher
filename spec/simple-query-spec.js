var q = require('q')
  , QCypher = require('../lib/index')
  , qcypher = new QCypher();

describe('Simple Query Suite', function() {
  'use strict';

  var graphDatabaseUrl = 'http://localhost:7474';
  qcypher.init(graphDatabaseUrl);

  describe('Clear database', function() {
    it('should succeed', function(done) {
      qcypher.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r', {})
        .then(function resolved(result) {
          expect(result).toBeDefined();
          done();
        }, function rejected(result){
          done();
        });
    });
  });

  describe('Connect to neo4j', function() {
    it('create node should return node', function(done) {
      qcypher.query('MERGE (n:QCypher {name: {value}}) RETURN n', {
        "value": "first"
      })
        .then(function resolved(result) {
          var data = result.data[0][0].data;
          expect(data.name).toBe('first');
          done();
        }, function rejected(result) {
          done();
        });
    });
  });

  describe('Invalid query', function() {
    it('should fail', function(done) {
      qcypher.query('MERGE (n:QCypher name: "first") RETURN n', {})
        .then(function resolved(result) {
          expect(false).toBeTrue(); // this should not happen
          done();
        }, function rejected(result) {
          expect(result.status.httpCode).toBe('400');
          done();
        });
    });
  });

});

