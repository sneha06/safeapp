#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var url = require('url');
var bodyParser = require('body-parser');
var trip = require('./trip');

/**
 *  Define the sample application.
 */
var SampleApp = function() {

  //  Scope.
  var self = this;


  /*  ================================================================  */
  /*  Helper functions.                                                 */
  /*  ================================================================  */

  /**
   *  Set up server IP address and port # using env variables/defaults.
   */
  self.setupVariables = function() {
    //  Set the environment variables we need.
    self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
    self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

    if (typeof self.ipaddress === "undefined") {
      //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
      //  allows us to run/test the app locally.
      console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
      self.ipaddress = "127.0.0.1";
    };
  };


  /**
   *  Set up mongodb
   */
  self.setupDB = function() {
    self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST,
      parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT));
    self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {
      auto_reconnect: true
    });
    self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
    self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
  };


  /**
   *  Populate the cache.
   */
  self.populateCache = function() {
    if (typeof self.zcache === "undefined") {
      self.zcache = {
        'README.md': ''
      };
    }

    //  Local cache for static content.
    self.zcache['index.html'] = fs.readFileSync('./index.html');
  };


  /**
   *  Retrieve entry (content) from cache.
   *  @param {string} key  Key identifying content to retrieve from cache.
   */
  self.cache_get = function(key) {
    return self.zcache[key];
  };


  /**
   *  terminator === the termination handler
   *  Terminate server on receipt of the specified signal.
   *  @param {string} sig  Signal to terminate on.
   */
  self.terminator = function(sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating sample app ...',
        Date(Date.now()), sig);
      process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()));
  };

  /**
   * Logic to open a database connection.
   * We are going to call this outside of app so it is available to all our functions inside.
   */
  self.connectDb = function(callback) {
    self.db.open(function(err, db) {
      if (err) {
        throw err
      };
      self.db.authenticate(self.dbUser, self.dbPass, {
        authdb: "admin"
      }, function(err, res) {
        if (err) {
          console.log(err);
          throw err
        };
        callback();
      });
    });
  };

  /**
   *  Setup termination handlers (for exit and a list of signals).
   */
  self.setupTerminationHandlers = function() {
    //  Process on exit and signals.
    process.on('exit', function() {
      self.terminator();
    });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
      process.on(element, function() {
        self.terminator(element);
      });
    });
  };


  /*  ================================================================  */
  /*  App server functions (main app logic here).                       */
  /*  ================================================================  */

  /**
   *  Create the routing table entries + handlers for the application.
   */
  self.createRoutes = function() {
    self.routes = {};

    self.routes['/asciimo'] = function(req, res) {
      var link = "http://i.imgur.com/kmbjB.png";
      res.send("<html><body><img src='" + link + "'></body></html>");
    };

    self.routes['/'] = function(req, res) {
      res.setHeader('Content-Type', 'text/html');
      res.send(self.cache_get('index.html'));
    };

    self.routes['/getlocation'] = function(req, res) {
      trip.locate(self.db, req.query.trip_id, function(results) {
        res.send(results);
      });
    };

  };


  /**
   *  Initialize the server (express) and create the routes and register
   *  the handlers.
   */
  self.initializeServer = function() {
    self.createRoutes();
    self.app = express.createServer();

    // parse application/x-www-form-urlencoded
    self.app.use(bodyParser.urlencoded({
      extended: true
    }));

    self.app.use(bodyParser.json());

    //  Add handlers for the app (from the routes).
    for (var r in self.routes) {
      self.app.get(r, self.routes[r]);
    }
    self.app.post('/createtrip', function(req, res) {
      trip.create(self.db, req.body.email, req.body.token,
        req.body.tracker, req.body.lat, req.body.long,
        function(results) {
          res.send(results);
        });
    });

    self.app.post('/updateloc', function(req, res) {
      trip.update(self.db, req.body.tripId, req.body.lat, req.body.long,
        function(results) {
          res.send(results);
        });
    });

  };


  /**
   *  Initializes the sample application.
   */
  self.initialize = function() {
    self.setupDB();
    self.setupVariables();
    self.populateCache();
    self.setupTerminationHandlers();

    // Create the express server and routes.
    self.initializeServer();
  };


  /**
   *  Start the server (starts up the sample application).
   */
  self.start = function() {
    //  Start the app on the specific interface (and port).
    self.app.listen(self.port, self.ipaddress, function() {
      console.log('%s: Node server started on %s:%d ...',
        Date(Date.now()), self.ipaddress, self.port);
    });
  };

}; /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.connectDb(zapp.start);
