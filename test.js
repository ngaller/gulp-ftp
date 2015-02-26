'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var Server = require('ftp-test-server');
var ftp = require('./');
var vfs = require('vinyl-fs');
var rimraf = require('rimraf');
var mockServer;

before(function (done) {
	mockServer = new Server();

	mockServer.init({
		user: 'test',
		pass: 'test'
	});

	mockServer.on('stdout', process.stdout.write.bind(process.stdout));
	mockServer.on('stderr', process.stderr.write.bind(process.stderr));

	setTimeout(done, 500);
});

after(function () {
	mockServer.stop();
});

it('should upload files to FTP-server', function (cb) {
	var stream = ftp({
		host: 'localhost',
		port: 3334,
		user: 'test',
		pass: 'test'
	});

	setTimeout(function () {
		assert(fs.existsSync('fixture/fixture.txt'));
		assert(fs.existsSync('fixture/fixture2.txt'));
		fs.unlinkSync('fixture/fixture.txt');
		fs.unlinkSync('fixture/fixture2.txt');
		fs.rmdirSync('fixture');
		cb();
	}, 500);

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname,
		path: __dirname + '/fixture/fixture.txt',
		contents: new Buffer('unicorns')
	}));

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname,
		path: __dirname + '/fixture/fixture2.txt',
		contents: new Buffer('unicorns')
	}));
});

it('should download files from FTP server', function(cb) {
  var stream = ftp.download({
    host: 'localhost', 
    port: 3334,
    user: 'test',
    pass: 'test'
  }, '/fixture');

  rimraf.sync('fixture');
  fs.mkdirSync('./fixture');
  fs.writeFileSync('./fixture/test.txt', 'TEST DATA');
  fs.writeFileSync('./fixture/test2.txt', 'TEST DATA');

  stream.pipe(vfs.dest('./fixture/output'));

  setTimeout(function() {
    assert(fs.existsSync('fixture/output/test.txt'));
    assert(fs.existsSync('fixture/output/test2.txt'));
    assert.equal("TEST DATA", fs.readFileSync('fixture/output/test.txt', 'utf-8'));
    rimraf.sync('fixture');
    cb();
  }, 500);
});
