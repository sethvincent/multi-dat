var request = require('request');

var options = { 
  uri: 'http://localhost:4635/dat',
  body: { name: 'some-name' },
  json: true
}

request.post(options, function (err, res, body) {
  console.log(body);
});

