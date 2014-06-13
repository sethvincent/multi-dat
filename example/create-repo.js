var request = require('request');

var options = { 
  uri: 'http://localhost:4635/dat', 
  json: true, 
  body: { name: 'some-name' }
}

request.post(options, function (err, res) {
  console.log(err, res);
});

