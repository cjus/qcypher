# QCypher

A [q/promise-based](http://documentup.com/kriskowal/q) pure JS library for working with [Neo4j](http://www.neo4j.org)

QCypher uses the Neo4j REST endpoints to issue HTTP requests to the graph database.  Asynchronous queries return Q promises in order to support query chaining.

The library itself aims to be the thinnest possible layer between NodeJS and Neo4j, while allowing that interface to remain dead simple. For more involved usages, QCypher has a set of batch query functions.  Use those functions when more than simple chaining is required.
  
## Install via NPM
QCypher may be installed via NPM.

    $ npm install qcypher

## Using QCypher

Using QCypher consists of requiring the module, initializing the module with the path to the graph database and issuing one or more query calls.
When querying a local database the qcypher.init() call is optional, but using it is good form.

Queries are written in the [Cypher query language](http://www.neo4j.org/learn/cypher) to interact with the graph.

```javascript
  var qcypher = require('qcypher')
    , q = require('q');

  qcypher.init('http://localhost:7474');
  qcypher.query("CREATE (s:Student {name:{student}.name, grade:{student}.grade}) RETURN s", {
    student: {
      name: "Scott Riggs",
      grade: 12
    }
  });
```

To retrieve data from the graph:

```javascript
  qcypher.query("MATCH (s:Student {name:{student}.name}) RETURN s", {
    student: {
      name: "Scott Riggs"
    }
  })
    .then(function(result) {
      var student = result.data[0][0].data;
      console.log('student', student);
    })
```

### Handling query errors
The following query is syntactically invalid and will cause Neo4j to return an error containing an exception and stack trace. This is valuable in helping you determine the cause of your error.

```javascript
  qcypher.query('MERGE (n:QCypher name: "first") RETURN n', {})
    .then(function(result) {
      expect(false).toBeTrue(); // this should not happen
      done();
    })
    .catch(function(error) {
      expect(error.exception).toBeDefined();
      done();
    });
```

When qCypher detects a Neo4j error is rejects its promise allowing you to capture the results in a catch clause as shown above.

View the jasmine-node tests for other examples.

![image](./images/student_graph_db.png)

## Tests
QCypher has a suite of tests in the `/spec` folder. In order to run the tests neo4j must be running and jasmine-node must be installed.

The test suite requires jasmine-node to be installed globally. If you don't have it installed run:

    $ npm install -g jasmine-node
    
Run the tests using:
`Warning`: these tests will flush your local database!

    $ npm test

