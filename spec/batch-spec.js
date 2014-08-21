var qcypher = require('../lib/index')
  , q = require('q');

var query = [
  'MATCH (cat:Category {name:{data}.name})-[:HAS]->(cue:Cue)',
  'OPTIONAL MATCH (cat)-[:HAS]->(cue)-[:HAS]-(background:Background)',
  'OPTIONAL MATCH (cat)-[:HAS]->(cue)-[:HAS]-(background)-[:HAS]-(sticker:Sticker)',
  'RETURN DISTINCT cue.text, ID(cue), background.id, sticker.id'
].join(' \n');

describe('batch Suite', function() {
  'use strict';
  var queryListObject;
  var graphDatabaseUrl = (process.env.GRAPHENEDB_URL) ? process.env.GRAPHENEDB_URL : 'http://localhost:7474';
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

  describe('Create batch', function() {
    it('should return query list object', function(done) {
      queryListObject = qcypher.batchCreate();
      expect(queryListObject).toBeDefined();
      expect(queryListObject.statements.length).toBe(0);
      done();
    });
  });

  describe('Batch append', function() {
    it('should return query list object with appended batch item', function(done) {
      queryListObject = qcypher.batchAppend(queryListObject, 'CREATE (n:QCypher {name: {data}.name}) RETURN n', {
        data: {
          name: "Charles"
        }
      });
      expect(queryListObject.statements.length).toBe(1);
      expect(queryListObject.statements[0].statement).toBe('CREATE (n:QCypher {name: {data}.name}) RETURN n');
      expect(queryListObject.statements[0].parameters.data.name).toBe('Charles');
      done();
    });
  });

  describe('Second batch append', function() {
    it('should contain two queries', function(done) {
      queryListObject = qcypher.batchAppend(queryListObject, 'CREATE (n:QCypher {name: {data}.name}) RETURN n', {
        data: {
          name: "Robin"
        }
      });
      expect(queryListObject.statements.length).toBe(2);
      done();
    });
  });

  describe('Batch execute', function() {
    it('should process both entries in the batch', function(done) {
      qcypher.batchExecute(queryListObject)
        .then(function(results) {
          expect(results.results.length).toBe(2);
          expect(results.errors.length).toBe(0);
          expect(results.results[0].data[0].row[0].name).toBe('Charles');
          expect(results.results[1].data[0].row[0].name).toBe('Robin');
          done();
        });
    });
  });

});

