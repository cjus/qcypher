var qcypher = require('../lib/index')
  , q = require('q');

var model = ['CREATE',
  '(c1:Cue {text:"Under 20"}),',
  '(c2:Cue {text:"Over 20"}),',
  '(cat1:Category {name:"noting"}),',
  '(c1)<-[:HAS]-(cat1),',
  '(c2)<-[:HAS]-(cat1),',
  '(a1:Asset:Background {id:"ebe158e6-f79d-4501-8d53-ad107fb30496"}),',
  '(a2:Asset:Background {id:"bc09c93c-c702-4003-8849-6ba35d980ec8"}),',
  '(a3:Asset:Background {id:"7688e377-7ac5-4c40-8a91-04868a1dfdbb"}),',
  '(a4:Asset:Background {id:"08e4d2ae-f886-4470-8a8b-d001540ca687"}),',
  '(a5:Asset:Background {id:"a5e6eb8c-afdd-480e-9c95-eea5ad3a02e0"}),',
  '(a6:Asset:Background {id:"b4b9c0bb-3d8f-44fc-ac81-04b73f63ab31"}),',
  '(a7:Asset:Background {id:"4d3f8be5-92ca-476d-a6b0-c9fad91230aa"}),',
  '(a8:Asset:Background {id:"14a4d929-a3ec-44ac-8107-31e3d88d2455"}),',
  '(a9:Asset:Background {id:"98debde6-74e1-45b5-8461-d23c57a8af6a"}),',
  '(a10:Asset:Background {id:"2a358ae4-80b7-4752-bef8-1511ee694410"}),',
  '(a11:Asset:Background {id:"884a6adc-736e-495a-a2a5-a8014e372718"}),',
  '(a12:Asset:Sticker {id:"233c8387-c0a4-4238-86ac-a77c0d624504"}),',
  '(a13:Asset:Sticker {id:"07dbbb79-389f-4c5c-85ce-74389f38c9ed"}),',
  '(c1)-[:HAS]->(a1),',
  '(c1)-[:HAS]->(a2),',
  '(c1)-[:HAS]->(a3),',
  '(c1)-[:HAS]->(a4),',
  '(a1)-[:HAS]->(a12),',
  '(a1)-[:HAS]->(a13),',
  '(c2)-[:HAS]->(a5),',
  '(c2)-[:HAS]->(a6),',
  '(c2)-[:HAS]->(a7),',
  '(c2)-[:HAS]->(a8),',
  '(c2)-[:HAS]->(a9),',
  '(c2)-[:HAS]->(a10),',
  '(c2)-[:HAS]->(a11),',
  '(a8)-[:HAS]->(a12),',
  '(a8)-[:HAS]->(a13)',
  'RETURN c1'
].join(' \n');

var query = [
  'MATCH (cat:Category {name:{data}.name})-[:HAS]->(cue:Cue)',
  'OPTIONAL MATCH (cat)-[:HAS]->(cue)-[:HAS]-(background:Background)',
  'OPTIONAL MATCH (cat)-[:HAS]->(cue)-[:HAS]-(background)-[:HAS]-(sticker:Sticker)',
  'RETURN DISTINCT cue.text, ID(cue), background.id, sticker.id'
].join(' \n');

describe('#load-model Suite', function() {
  'use strict';

  beforeEach(function(done) {
    var graphDatabaseUrl = (process.env.GRAPHENEDB_URL) ? process.env.GRAPHENEDB_URL : 'http://localhost:7474';
    qcypher.init(graphDatabaseUrl);
    done();
  });

  describe('Clear database', function() {
    it('should return node', function(done) {
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

  describe('Upload model', function() {
    it('should return node', function(done) {
      qcypher.query(model, {})
        .then(function(result) {
          var data = result.data[0][0].data;
          expect(data.text).toBe('Under 20');
          done();
        })
        .catch(function(result) {
          console.log('result', result);
          done();
        });
    });
  });

  describe('Query model', function() {
    it('should return valid object', function(done) {
      qcypher.query(query, {
        data: {
          name: "noting"
        }
      })
        .then(function(result) {
          expect(result.data[0][2]).toBe('ebe158e6-f79d-4501-8d53-ad107fb30496');
          expect(result.data.length).toBe(13);
          done();
        })
        .catch(function(result) {
          console.log('result', result);
          expect('exception').toBe(false);
          done();
        });
    });
  });


});

