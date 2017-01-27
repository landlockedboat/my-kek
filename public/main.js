$(function() {
  var $window = $(window);
  // Input field for the username
  var $usernameInput = $('.usernameInput');

  var $loginPage = $('.login.page');
  var $mainPage = $('.main.page');

  var username;
  var connected=false;
  var $currentInput = $usernameInput.focus();

  var socket=io();

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $mainPage.show();
      $loginPage.off('click');
      // Tell the server your username
      socket.emit('add user', username);
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
      if (username) {
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

  socket.on('login', function(data){
    connected = true;
    console.log("You are connected.")
  });

});
