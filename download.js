'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var JSFtp = require('jsftp');
var es = require('event-stream');
var assert = require('assert');

module.exports = function(options, remotePath) {


  function getFile(path, enc, callback) {
    var ftp = new JSFtp(options);
    ftp.get(remotePath + '/' + path, function(err, socket) {
      if(!err) {
        // XXX not sure why this is not working?
        //var file = new gutil.File({
         // path: path,
         // contents: socket
        //});
        var buf = new Buffer(0);
        socket.on('data', function(data) {
          buf = Buffer.concat([buf, data]);
        });
        socket.on('error', function(error) {
          callback(error, null);
        });
        socket.on('close', function(hadErr) {
          if(!hadErr) {
            var file = new gutil.File({
              path: path,
              contents: buf
            });
            callback(null, file);
          }
        });
        socket.resume();
      } else {
        callback(err, null);
      }
    });
  }
  var stream = through.obj(getFile);

  var ftp = new JSFtp(options);

  ftp.ls(remotePath, function(err, res) {
    res.forEach(function(file) {
      stream.write(file.name);
      /*
      stream.write(new gutil.File({
        path: file.name,
        contents: new Buffer("TEST TEST")
      }));
      */
    });
    stream.end();
  });
  

/*
  var file = new gutil.File({
    cwd: "/test/",
    base: "/test/",
    path: "/test/file.coffee",
    contents: new Buffer("Test test")
  });

  stream.write(file);
  */

  return stream;
};

