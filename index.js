var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var dat = require('dat');

module.exports = MultiDat;

function MultiDat (db, options) {
  if (!(this instanceof MultiDat)) return new MultiDat(db, options);
  options || (options = {});

  this.reposDir = options.reposDir || 'repos';
  this.host = options.host || 'http://localhost';
  this.db = db;
  
  this.server = this.createServer();
  this.startDatServers();
}

MultiDat.prototype.createServer = function() {
  var self = this;
  
  var app = express();
  app.use(bodyParser.json());

  app.get('/', function (req, res) {
    var results = [];
    self.db.createReadStream()
      .on('data', function (data) {
        results.push(data);
      })
      .on('end', function () {
        res.json(results);
      });
  });

  app.post('/dat', function (req, res) {
    var db = dat(path.join(process.cwd(), self.reposDir, req.body.name), function (err) {

      db.listen(function (err) {
        var port = db._server.address().port
        var url = self.host + ':' + port;

        self.db.put(req.body.name, { url: url, port: port }, function (dbErr) {
          if (err) throw err;
          res.json(req.body);
        });
      });

    });
  });

  return app;
};

MultiDat.prototype.startDatServers = function startDatServers () {
  var self = this;

  this.db.createReadStream()
    .on('data', function (data) {
      var repo = path.join(process.cwd(), self.reposDir, data.key);

      var db = dat(repo, function (err) {
        if (err) throw err;
      });

      db.listen(data.value.port, function (err) {
        if (err) console.log(err);
        console.log('dat db ' + data.key + ' started on ' + data.value.url);
      });
    })
    .on('end', function () {
      console.log('existing dat servers listening');
    }); 
}

MultiDat.prototype.listen = function listen (port, cb) {
  this.server.listen(port, cb);
};
