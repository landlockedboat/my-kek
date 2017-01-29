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
// Users connected at the moment
var onlineUsers={};
// Number of connected users at the moment
var numUsers = 0;

function print_users(){
  console.log('Printing all users...')
  for (u in users){
    console.log('  ' + users[u].username);
  }
}

function save_users(){

}

function load_users(){

}

function errorUserNotExists(username) {
  console.log('User ' + username + ' does not exist.');
}

function errorUserNotConnected(username) {
  console.log('User ' + username + ' is not connected.');
}

function errorDuringTransaction(data){
  var su = data[0];
  var ru = data[1];
  console.log('Cannot complete transaction between ' +
    su + ' and ' + ru + '. Reason:');
}

function logUserScore(username){
  console.log('User ' + username + ' has ' +
  users[username].score + ' points.');
}

function logTransactionCompleted(data){
  var su = data[0];
  var ru = data[1];
  console.log('Transaction between ' +
    su + ' and ' + ru + ' completed successfully.');
}

io.on('connection', function (socket){
  var addedUser = false;

  socket.on('add user', function (username) {
    if(addedUser)
      return;

    if(!users[username]){
      // Adding new user to our database
      var user = {};
      user.score = 10;
      user.username = username;
      users[username] = user;
      console.log('New user added: ' + username);
      print_users();
    }

    // We add the user to our connected users list to enable direct communication
    // between users in real time
    onlineUsers[username] = socket;
    // We store the username in the socket session for this client
    socket.username = username;
    addedUser = true;

    socket.emit('login', {
      score: users[username].score,
      users: users
    });

    socket.broadcast.emit('added user', {
      score: users[username].score,
      users: users
    });

  });

// Data contains the names of the users sending(0) and recieving(1) the
// score
  socket.on('add score', function(data){
    var sender_username = data[0];
    var reciever_username = data[1];

    var sender = users[sender_username]
    if(!sender){
      errorDuringTransaction(data);
      errorUserNotExists(sender_username);
      return;
    }

    if(sender.score <= 0){
      errorDuringTransaction(data);
      logUserScore(sender_username);
      return;
    }

    var reciever = users[reciever_username];
    if(!reciever){
      errorDuringTransaction(data);
      errorUserNotExists(reciever_username);
      return;
    }

    reciever.score += 1;
    sender.score -= 1;

    // We check if the sender is connected right now
    // if she's not, we log an error, because this
    // action cannot (presumably) be done offline
    // FIXME maybe i should bail out of the transaction
    // if the sender is not online
    var sender_socket = onlineUsers[sender_socket];

    if(sender_socket){
      sender_socket.emit('update score', sender.score);
    }
    else {
      errorUserNotConnected(sender_socket);
    }

    var reciever_socket = onlineUsers[reciever_username];

    if(reciever_socket){
      reciever_socket.emit('update score', reciever.score);
    }

    // We log all the delicious messages of victory
    logTransactionCompleted(data);
    logUserScore(sender_username);
    logUserScore(reciever_username);

  });

});
