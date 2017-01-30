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
  var $userButtons = $('.button.list');
  // Label with the user score
  var $userScore = $('#score');
  // Label with the user name
  var $userName = $('#username');
  // Label with the remaining time to more keks
  var $clock = $('#clock');

  var current_username;
  var connected=false;
  var $currentInput = $usernameInput.focus();

  var socket=io();
  // Function used for the clock
  function getTimeRemaining(endtime){
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    var hours = Math.floor( (t/(1000*60*60)) % 24 );
    var days = Math.floor( t/(1000*60*60*24) );
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  function initializeClock(endtime){
    function updateClock(){
      var t = getTimeRemaining(endtime);
      function slice(time){
        return ('0' + time).slice(-2);
      }
      $clock.text (slice(t.hours) + ':' +
        slice(t.minutes) + ':' + slice(t.seconds));
      if(t.total<=0){
        clearInterval(timeinterval);
      }
    }
    updateClock(); // run function once at first to avoid delay
    var timeinterval = setInterval(updateClock,1000);
  }

  // Sets the client's username
  function setUsername () {
    current_username = cleanInput($usernameInput.val().trim());
    // If the username is valid
    if (current_username) {
      // Tell the server your username
      socket.emit('add user', current_username);
    }
    else {
      // That counts as a login failed
      alertLoginFailed();
    }
  }

  function fadeToMain(){
    $loginPage.fadeOut();
    $mainPage.show();
    $loginPage.off('click');
  }

  // Erases all button inside the ul
  function eraseUserButtons(){
    $('.user.button.list button').remove();
  }

  // This creates all the buttons hanging from the user buttons list
  function createUsersButtons(users){
    var clickfunc = function(){
      if (confirm('Enviar un kek a ' + this.id + ' ?')) {
          socket.emit('add score', [current_username, this.id]);
      }
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
      $butt.addClass('user_button');
      $userButtons.append($butt);
    }
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  function updateScore(new_score){
    $userScore.text(new_score);
  }

  function alertLoginFailed(){
    alert('Error en el login.');
  }

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if(!connected){
        setUsername();
      }
    }
  });

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  socket.on('reset clock', function(data){
    // We update the users buttons
    updateScore(data.score);
    initializeClock(data.endtime);
  });

  socket.on('added user', function(data){
    // We update the users buttons
    eraseUserButtons();
    createUsersButtons(data.users);
  });

  socket.on('login', function(data){
    connected = true;
    fadeToMain();
    $userName.text(current_username);
    initializeClock(data.endtime);
    updateScore(data.score);
    createUsersButtons(data.users);
  });

  socket.on('login failed', function(){
    alertLoginFailed();
  });

  socket.on('update score', function(new_score){
    updateScore(new_score);
  });
});
