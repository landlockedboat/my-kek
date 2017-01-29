$(function() {
  var $window = $(window);
  // Input field for the username
  var $usernameInput = $('.usernameInput');

  var $loginPage = $('.login.page');
  // Main page, where the score is displayed and the main interaction with
  // the app happens
  var $mainPage = $('.main.page');
  // Here we hold a reference to a ul from which hang all buttons
  // representing the registered users.
  var $userButtons = $('.user.button.list');
  // Label with the user score
  var $userScore = $('.user.score');

  var current_username;
  var connected=false;
  var $currentInput = $usernameInput.focus();

  var socket=io();

  // Sets the client's username
  function setUsername () {
    current_username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (current_username) {
      $loginPage.fadeOut();
      $mainPage.show();
      $loginPage.off('click');
      // Tell the server your username
      socket.emit('add user', current_username);
    }
  }

  // Erases all button inside the ul
  function eraseUserButtons(){
    $('.user.button.list button').remove();
  }

  // This creates all the buttons hanging from the user buttons list
  function createUsersButtons(users){
    var clickfunc = function(){
      socket.emit("add score", [current_username, this.id]);
    };

    for(var u in users){
      var rec_username = users[u].username;
      if(rec_username == current_username)
        continue;

      var $butt = $('<button/>', {
        text: rec_username,
        id: u,
        click: clickfunc
      });
      $userButtons.append($butt);
    }
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }


  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (current_username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  socket.on('added user', function(data){
    // We update the users buttons
    eraseUserButtons();
    createUsersButtons(data.users);
  });

  socket.on('login', function(data){
    connected = true;
    console.log("You are connected.");
    $userScore.text('Score: ' + data.score);
    createUsersButtons(data.users);
  });
});
