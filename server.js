var appPort = 80   ; 
var express = require('express'), app = express();
var emoji = require('node-emoji');
var http = require('http') 
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
  
var fs = require('fs');
var pseudoArray = []; 
   
  
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

// Render main page
   
app.get('/', function(req, res){
   res.render('home');
});   

server.listen(appPort); 

// socket.io

var users = 0; 
 
io.sockets.on('connection', function (socket) { 
	users += 1; 
	reloadUsers(); 
	socket.on('message', function (data) { // Broadcast the message to all
		if(pseudoSet(socket))
		{   
			var transmit = { pseudo : socket.nickname, message : emoji.emojify(data) };
			socket.broadcast.emit('message', transmit);
		}    
	}); 
	socket.on('user_image', function (data) { 
		if(pseudoSet(socket))
		{   
			var transmit = { pseudo : socket.nickname, message : emoji.emojify(data) };
			socket.broadcast.emit('user_image', transmit);
		}     
	}); 
	socket.on('setPseudo', function (data) { 
		if (pseudoArray.indexOf(data) == -1) 
		{
			pseudoArray.push(data);
			socket.nickname = data;
			socket.emit('pseudoStatus', 'ok');
			socket.broadcast.emit('join_left', data+" joined !");
			reloadUsers();    
		}
		else
		{
			socket.emit('pseudoStatus', 'error') 
		}
	});
	socket.on('disconnect', function () { 
		users -= 1;
		if (pseudoSet(socket))
		{ 
			var pseudo;
			pseudo = socket.nickname;
			socket.broadcast.emit('join_left', pseudo+" left !");
			var index = pseudoArray.indexOf(pseudo);
			pseudoArray.splice(index , 1);
			reloadUsers();
		}else{ 
			reloadUsers(); 
		} 
		  
	});   
	socket.on('typing', function (data) {
      socket.broadcast.emit('typing', data);
    });  
	    
});  
   
function reloadUsers() {  
		io.sockets.emit('nbUsers', {"nb": users});
		/*var remain_people  = pseudoArray.filter(x => left_people.indexOf(x) == -1); 
		io.sockets.emit('nbUsers', {"nb": users , "connected_user_names": remain_people });*/
}   
 


function pseudoSet(socket) { 
	var test;
	if (socket.nickname == null ) test = false;
	else test = true;
	return test;
}