var q = require('q')
  , QCypher = require('../lib/index')
  , qcypher = new QCypher();

var model = [
  "CREATE",
  "(s1:Student {name: 'Scott Riggs', grade: 12}),",
  "(s2:Student {name: 'Peggy Sue', grade: 12}),",
  "(s3:Student {name: 'Jenny Lo', grade: 12}),",
  "(s4:Student {name: 'Tim Hasket', grade: 12}),",
  "(t1:Teacher {name: 'Ms. Hansel'}),",
  "(t1)-[:HAS]->(s1),",
  "(t1)-[:HAS]->(s2),",
  "(t1)-[:HAS]->(s3),",
  "(t1)-[:HAS]->(s4)",
  "RETURN t1"
].join(' \n');

describe('#Students Query Suite', function() {
  'use strict';

  var graphDatabaseUrl = process.env.GRAPHENEDB_URL || 'http://localhost:7474';
  qcypher.init(graphDatabaseUrl);

  describe('Clear database', function() {
    it('should succeed', function(done) {
      qcypher.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r', {})
        .then(function resolved(result) {
          expect(result).toBeDefined();
          done();
        }, function rejected(result) {
          console.log('result', result);
          done();
        });
    });
  });

  describe('Adding a student', function() {
    it('should succeed', function(done) {
      qcypher.query("CREATE (s:Student {name:{student}.name, grade:{student}.grade}) RETURN s", {
        student: {
          name: "Scott Riggs",
          grade: 12
        }
      })
        .then(function resolved(result) {
          var data = result.data[0][0].data;
          expect(data.name).toBe('Scott Riggs');
          expect(data.grade).toBe(12);
          done();
        }, function rejected(result) {
          console.log('result', result);
          done();
        });
    });
  });


  describe('Finding a student', function() {
    it('should succeed', function(done) {
      qcypher.query("MATCH (s:Student {name:{student}.name}) RETURN s", {
        student: {
          name: "Scott Riggs"
        }
      })
        .then(function resolved(result) {
          var data = result.data[0][0].data;
          expect(data.name).toBe('Scott Riggs');
          expect(data.grade).toBe(12);
          done();
        }, function rejected(result) {
          console.log('result', result);
          done();
        });
    });
  });


  describe('Creating the student graph', function() {
    it('should succeed', function(done) {
      qcypher.query('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r', {})
        .then(function() {
          qcypher.query(model, {})
            .then(function resovled(result) {
              done();
            }, function rejected(result) {
              console.log('result', result);
              done();
            });
        });
    });
  });

});

