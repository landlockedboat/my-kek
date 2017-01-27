var fs = require('fs');
// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFile(__dirname + '/start.log', 'started');
});

// Routing
app.use(express.static(__dirname + '/public'));

var users = {};
// Number of connected users at the moment
var numUsers = 0;

io.on('connection', function (socket){
  var addedUser = false;

  socket.on('add user', function (username) {
    if(addedUser)
      return;

    if(!users[username]){
      // Adding new user to our database
      var user = {};
      user.score = 0;
      user.username = username;
      users[username] = user;
    }

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });
});

