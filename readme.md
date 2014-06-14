# multi-dat

Manage multiple dat repositories through a JSON API.

## Too soon, don't use.

This is a simplistic prototype, and may be completely rewritten. Meant to address [issue #41 in the dat repo](https://github.com/maxogden/dat/issues/41).

multi-dat creates new dat repos in a `repos` folder, and provides a JSON array at the root url of all the dat repos and their urls.

## Example

Install: `npm install --save sethvincent/multi-dat`

Use multi-dat with a leveldb that's used to track the dat repos that have been created.

```
var MultiDat = require('multi-dat');
var level = require('level');
var db = level(__dirname + '/db', { valueEncoding: 'json' });

var multi = MultiDat(db);

multi.listen('4635', function (err) {
  console.log('multi-dat started on localhost:4635');
});
```

Create a new repo by sending a POST to the `/dat` endpoint like this:

```
var request = require('request');

var options = { 
  uri: 'http://localhost:4635/dat', 
  json: true, 
  body: { name: 'name-repo-folder-is-given' }
}

request.post(options, function (err, res) {
  console.log(err, res);
});

```

## License
MIT
