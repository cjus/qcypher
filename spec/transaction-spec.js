var q = require('q')
  , QCypher = require('../lib/index')
  , qcypher = new QCypher();

describe('#Transaction Test', function() {
  'use strict';
  var transobj = qcypher.transCreate()
    , transactionExpire;

  describe('Executing a transaction', function() {
    it('should succeed', function(done) {
      qcypher.transExecute(transobj, [
        {
          "statement": "CREATE (n:TNode {id:1}) RETURN n;",
          "parameters": {}
        },
        {
          "statement": "CREATE (n:TNode {id:2}) RETURN n;",
          "parameters": {}
        },
        {
          "statement": "CREATE (n:TNode {id:3}) RETURN n;",
          "parameters": {}
        }
      ])
        .then(function(result) {
          transactionExpire = transobj.expires;
          expect(result.results.length).toBe(3);
          expect(result.errors.length).toBe(0);
          expect(transobj.expires).toBeDefined();
          expect(transobj.expires.length).toNotBe(0);
          done();
        });
    });
  });

  describe('Resetting transaction timeout', function() {
    it('should reset transaction timeout', function(done) {
      function doTimeout() {
        qcypher.transResetTimeout(transobj)
          .then(function(result) {
            expect(result.errors.length).toBe(0);
            expect(transobj.expires).toBeDefined();
            expect(transobj.expires.length).toNotBe(0);
            expect(transactionExpire).toNotBe(transobj.expires);
            done();
          });
      }
      setTimeout(doTimeout, 3000);
    });
  });

  describe('Rolling back a transaction', function() {
    it('should succeed', function(done) {
      qcypher.transRollback(transobj)
        .then(function(result) {
          expect(result.results.length).toBe(0);
          expect(result.errors.length).toBe(0);
          done();
        });
    });
  });

  describe('Committing a rolled back transaction', function() {
    it('should fail', function(done) {
      qcypher.transCommit(transobj)
        .then(function resolved(result) {
          expect(true).toBeFalse();
          done();
        }, function reject(result) {
          expect(result.status.httpCode).toBe('404');
          done();
        });
    });
  });

  describe('Creating and committing a transaction', function() {
    it('should succeed', function(done) {
      qcypher.transExecute(transobj, [
        {
          "statement": "CREATE (n:TNode {id:1}) RETURN n;",
          "parameters": {}
        },
        {
          "statement": "CREATE (n:TNode {id:2}) RETURN n;",
          "parameters": {}
        },
        {
          "statement": "CREATE (n:TNode {id:3}) RETURN n;",
          "parameters": {}
        }
      ])
        .then(function() {
          qcypher.transCommit(transobj)
            .then(function resolved(result) {

              done();
            }, function reject(result) {
              expect(result.status.httpCode).toBe('404');
              done();
            });
        })

    });
  });

});

