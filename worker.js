var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);
  
  var app = require('express')();
  var mysql = require('mysql');
  var pool = mysql.createPool({
      connectionLimit : 500,
      host            : '127.0.0.1',
      user            : 'root',
      password        : 'pass1234',
      database        : 'authTester',
      debug           : false
  });
  var sha256 = require('sha256');
  
  var httpServer = worker.httpServer;
  var scServer = worker.scServer;
  
  app.use(serveStatic(path.resolve(__dirname, 'public')));

  httpServer.on('request', app);

  app.set('views', __dirname+'/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));

  app.get('*',function(req,res) {
    res.render('index',{
      title:'Tester App'
    });
  });

  
  // Socketcluster Connections
  scServer.on('connection', function (socket) {

    socket.on('login',function(data,respond) {
      var getAllUsers = 'SELECT * FROM users WHERE email = ?'
      pool.query(getAllUsers, [data.email], function(err,rows) {
        if (err) {
          console.log(err)
          respond(err)
        } else {
          if (rows.length) {
            if (sha256(data.password) == rows[0].password) {
              socket.setAuthToken({email:data.email})
              respond(null)
            } else {
              respond('Passwords do not match')
            }
          } else {
            respond('That account does not exist.')
          }
        }
      });
    });

    socket.on('logout',function(data,respond) {
      socket.removeAuthToken()
      respond(null)
    })

  });
};