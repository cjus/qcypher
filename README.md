# QCypher

A [q/promise-based](http://documentup.com/kriskowal/q) pure JS library for working with [Neo4j](http://www.neo4j.org)

QCypher uses the Neo4j REST endpoints to issue HTTP requests to the graph database.  Asynchronous queries return Q promises in order to support query chaining.

The library itself aims to be the thinnest possible layer between NodeJS and Neo4j, while allowing that interface to remain dead simple. For more involved usages, QCypher has a set of transaction query functions.  Use those functions when more than simple chaining is required.

[![NPM Stats](https://nodei.co/npm/qcypher.png?downloads=true)](https://npmjs.org/package/qcypher)

## Install via NPM
QCypher may be installed via NPM.

    $ npm install qcypher

## Using QCypher

Using QCypher consists of requiring the module, initializing the module with the path to the graph database and issuing one or more query calls.
When querying a local database the qcypher.init() call is optional, but using it is good form.

Queries are written in the [Cypher query language](http://www.neo4j.org/learn/cypher) to interact with the graph.

> Earlier versions of QCypher only allowed you to import and use the module. This meant that you could only use one Neo4j database at one time. You must now require qcypher which returns a constructor function, then you can create an instance for use as before.

> var QCypher = require('qcypher')
>  	, qcypher = new QCypher();
>  	



```
  var QCypher = require('qcypher')
  	, qcypher = new QCypher()
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

```
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

**NOTE**: QCypher uses Cypher query parameters.  For more information see:  [Neo4j Cypher Parameters](http://docs.neo4j.org/chunked/stable/cypher-parameters.html)

![image](./images/student_graph_db.png)

### Error Handling

All QCypher functions add a status object to the results it returns.

```
status: {
  statusCode: '201',
  httpCode: '201',
  httpMessage: 'Created',
  httpDescription: 'Resource created'
}
```

The following common errors are tracked:

httpCode    |   httpMessage             |   httpDescription
----------- |   ----------------------  |   ------------------------------------
200         |   OK                      |   Request succeeded without error
201         |   Created                 |   Resource created
400         |   Bad Request             |   Request is invalid, missing parameters?
401         |   Unauthorized            |   User isn't authorized to access this resource
402         |   Request Failed          |   Parameters are valid but request still failed
404         |   Not Found               |   The requested resource was not found on the server
429         |   Too Many Request        |   Too many requests issue within a period
500         |   Server Error            |   An error occurred on the server
501         |   Method Not Implemented  |   The requested method / resource isn't implemented on the server
503         |   Service Unavailable     |   The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. The implication is that this is a temporary condition which will be alleviated after some delay

Look at the result’s status object for request status:

**IMPORTANT**:	`httpCode` less than 300 is returned when the Q promise is resolved, 300 and greater are treated as errors and returned via reject.

```
  qcypher.query('SERGE (n:Node name: "Test") RETURN n', {})
    .then(function resolve(result) {
    	console.log(‘Success’, result.status.httpCode);
    }, function reject(result) {
        console.log(‘Failure’, result.status.httpCode);
    });
```

In the example above `SERGE` is an invalid Cypher command (should have been `MERGE`) and so the example returns a 400 error indicating that we sent a `Bad Request`.


### Handling query errors
The following query is syntactically invalid and will cause Neo4j to return an error containing an exception and stack trace. This is valuable in helping you determine the cause of your error.

```
  qcypher.query('MERGE (n:QCypher name: "first") RETURN n', {})
    .then(function resolve(result) {
      expect(false).toBeTrue(); // this should not happen
      done();
    }, function reject(result) {
      expect(error.exception).toBeDefined();
      done();
    });
```

In the example above note that the Q.then handler accepts two functions, a resolve and reject function.  The functions are named in the example above for clarity.  Another way to write this is:

```
  function resolve(result) {
      expect(false).toBeTrue(); // this should not happen
      done();
  }
  function reject(result) {
      expect(error.exception).toBeDefined();
      done();
  }
  qcypher.query('MERGE (n:QCypher name: "first") RETURN n', {})
    .then(resolve, reject);
```

When qCypher detects a Neo4j error it rejects its promise allowing you to capture the results in the reject handler as shown above.

You can console log the error using `console.log('error', JSON.stringify(error));`  

Here we see clues to the cause of the problem. Note, that the information returned in the `message` is the same returned in the Cypher web browser console.

```
{
  "message": "Invalid input 'n': expected whitespace, comment, NodeLabel, MapLiteral, a parameter, ')' or a relationship pattern (line 1, column 18)\n\"MERGE (n:QCypher name: \"first\") RETURN n\"\n                  ^",
  "exception": "SyntaxException",
  "fullname": "org.neo4j.cypher.SyntaxException",
  "stacktrace": [
    "org.neo4j.cypher.internal.compiler.v2_1.parser.CypherParser$$anonfun$parse$1.apply(CypherParser.scala:58)",
    "org.neo4j.cypher.internal.compiler.v2_1.parser.CypherParser$$anonfun$parse$1.apply(CypherParser.scala:48)",
    "scala.collection.TraversableLike$$anonfun$map$1.apply(TraversableLike.scala:244)",
    "scala.collection.TraversableLike$$anonfun$map$1.apply(TraversableLike.scala:244)",
    "scala.collection.immutable.List.foreach(List.scala:318)",
    "scala.collection.TraversableLike$class.map(TraversableLike.scala:244)",
    "scala.collection.AbstractTraversable.map(Traversable.scala:105)",
    "org.neo4j.cypher.internal.compiler.v2_1.parser.CypherParser.parse(CypherParser.scala:47)",
    "org.neo4j.cypher.internal.compiler.v2_1.CypherCompiler.isPeriodicCommit(CypherCompiler.scala:133)",
    "org.neo4j.cypher.internal.CypherCompiler.isPeriodicCommit(CypherCompiler.scala:91)",
    "org.neo4j.cypher.internal.ServerExecutionEngine.isPeriodicCommit(ServerExecutionEngine.scala:34)",
    "org.neo4j.cypher.javacompat.internal.ServerExecutionEngine.isPeriodicCommitQuery(ServerExecutionEngine.java:56)",
    "org.neo4j.server.rest.web.CypherService.cypher(CypherService.java:99)",
    "java.lang.reflect.Method.invoke(Method.java:606)",
    "org.neo4j.server.rest.transactional.TransactionalRequestDispatcher.dispatch(TransactionalRequestDispatcher.java:139)",
    "java.lang.Thread.run(Thread.java:744)"
  ]
}
```

View the tests in the project’s spec folder for other examples.

## Transactions

For more complex queries and use cases, QCypher supports transactions.

Neo4j transaction support is outlined here: http://docs.neo4j.org/chunked/stable/rest-api-transactional.html 

> Note: QCypher does NOT support batch operations as defined here: http://docs.neo4j.org/chunked/stable/rest-api-batch-ops.html  

Only transactions are supported.

## Working with Transactions

You can create a transaction using `transCreate` and execute one or more cypher statements using `transExecute`. If you recieve an error and wish to abort a transaction you can do so with `transRollback`.

Open transactions time out after a fixed amount of time, determined by the Neo4j database.  If you're preforming a lengthy operation you can extend the life of an open transaction using `transResetTimeout`.

Finally, once you're done with a transaction you can commit it using `transCommit`.

```
  var transobj = qcypher.transCreate();
  var promise = qcypher.transExecute(transobj, [
    {
      "statement": "MERGE (n:TNode {id:1}) RETURN n;",
      "parameters": {}
    },
    {
      "statement": "MERGE (n:TNode {id:2}) RETURN n;",
      "parameters": {}
    },
    {
      "statement": "MERGE (n:TNode {id:3}) RETURN n;",
      "parameters": {}
    }
  ]);

  promise.then(
    function resolve(result) {
      // execute of three statments succeeded so let's commit the transaction
      qcypher.transCommit(transobj);
    },
    function reject(result) {
      // no need to call qcypher.transRollback() because transaction was rejected.
    }
  );
```

## Tests
QCypher has a suite of tests in the `/spec` folder. In order to run the tests neo4j must be running and jasmine-node must be installed.

The test suite requires jasmine-node to be installed globally. If you don't have it installed run:

    $ npm install -g jasmine-node
    
Run the tests using:
`Warning`: these tests will flush your local database!

    $ npm test
    
You can run an individual test using:

    $ jasmine-node spec/transaction-spec.js —-verbose

