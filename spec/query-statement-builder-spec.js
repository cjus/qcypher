var q = require('q')
  , QCypher = require('../lib/index')
  , qcypher = new QCypher();

describe('#queryStatementBuilder Suite', function() {
  'use strict';

  describe('Query', function() {

    it('building a simple query should succeed', function(done) {
      var queryTemplateIn = 'MATCH (u:User {userID: {params}.userID}), (e:Events {name: "Events"}) ' +
        'CREATE ' +
        '(u)-[:<%=eventType%> {ts: {params}.ts}]->(e) ' +
        'RETURN true;';
      var queryTemplateOut = 'MATCH (u:User {userID: {params}.userID}), (e:Events {name: "Events"}) ' +
        'CREATE ' +
        '(u)-[:JOINED_EVENT {ts: {params}.ts}]->(e) ' +
        'RETURN true;';

      var query = qcypher.queryStatementBuilder(queryTemplateIn, {
        eventType: 'JOINED_EVENT'
      });

      expect(query).toBe(queryTemplateOut);
      done();
    });
  });

});

