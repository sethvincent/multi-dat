var Router = require('routes-router');
var http = require('http');
var path = require('path');
var dat = require('dat');

module.exports = MultiDat;

function MultiDat (db, options) {
  if (!(this instanceof MultiDat)) return new MultiDat(db, options);
  options || (options = {});

  this.reposDir = options.reposDir || 'repos';
  this.host = options.host || 'http://localhost';
  this.db = db;
  
  this.routes();
  this.startDatServers();
}

MultiDat.prototype.routes = function() {
  var self = this;
  var router = new Router();

  router.addRoute('/', function (req, res) {
    var results = [];
    self.db.createReadStream()
      .on('data', function (data) {
        results.push(data);
      })
      .on('end', function () {
        res.end(JSON.stringify(results));
      });
  });

  router.addRoute('/dat', function (req, res) {
    var body = '';

    req.on('data', function (data) {
      body += data;
    });

    req.on('end', function () {
      body = JSON.parse(body);

      if (req.method === 'POST') {
        var db = dat(path.join(process.cwd(), self.reposDir, body.name), function (err) {

          db.listen(function (err) {
            var port = db._server.address().port
            var url = self.host + ':' + port;
            var data = { name: body.name, url: url, port: port };

            self.db.put(body.name, data, function (dbErr) {
              if (err) throw err;
              res.end(JSON.stringify(body));
            });
          });

        });
      }
    });
  });

  this.server = http.createServer(router);
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
