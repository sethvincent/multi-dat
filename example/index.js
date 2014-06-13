var MultiDat = require('../index');
var level = require('level');
var db = level(__dirname + '/db', { valueEncoding: 'json' });

var multi = MultiDat(db);

multi.listen('4635', function (err) {
  console.log('multi-dat started on localhost:4635');
});