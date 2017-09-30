//	Customization
  
var appPort = 80   ; 
   
// Librairies
  
var express = require('express'), app = express();
var emoji = require('node-emoji');
var http = require('http') 
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
  
var fs = require('fs');
// var io = require('socket.io').listen(app);
var pseudoArray = []; 
var left_people = [];
   
// Views Options

app.set('views', __dirname + '/views');
 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

// Render and send the main page
  
app.get('/', function(req, res){
   res.render('home');
});   

server.listen(appPort);
// app.listen(appPort);
console.log("Server listening on port " + appPort);

// Handle the socket.io connections

var users = 0; //count the users
 
io.sockets.on('connection', function (socket) { // First connection
	users += 1; // Add 1 to the count
	reloadUsers(); // Send the count to all the users  
	socket.on('message', function (data) { // Broadcast the message to all
		if(pseudoSet(socket))
		{   
			var transmit = {date : new Date().toISOString(), pseudo : socket.nickname, message : emoji.emojify(data) };
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+ data +"\"");
		}    
	}); 
	socket.on('user_image', function (data) { // Broadcast the message to all
		if(pseudoSet(socket))
		{   
			var transmit = {date : new Date().toISOString(), pseudo : socket.nickname, message : emoji.emojify(data) };
			socket.broadcast.emit('user_image', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+ data +"\"");
		}     
	}); 
	socket.on('setPseudo', function (data) { // Assign a name to the user
		if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
			pseudoArray.push(data);
			socket.nickname = data;
			socket.emit('pseudoStatus', 'ok');
			console.log("user " + data + " connected");
			socket.broadcast.emit('join_left', data+" joined !");
			reloadUsers();    
		}
		else
		{
			socket.emit('pseudoStatus', 'error') // Send the error
		}
	});
	socket.on('disconnect', function () { // Disconnection of the client
		users -= 1;
		if (pseudoSet(socket))
		{ 
			console.log("disconnect...");
			var pseudo;
			pseudo = socket.nickname;
			console.log(pseudo +" gone");
			socket.broadcast.emit('join_left', pseudo+" left !");
			var index = pseudoArray.indexOf(pseudo);
			pseudo.slice(index - 1, 1);
			left_people.push(pseudo);
			reloadUsers();
		}else{
			reloadUsers();
		} 
		  
	});   
	socket.on('typing', function (data) {
      socket.broadcast.emit('typing', data);
    });  
	    
});  
   
function reloadUsers() { // Send the count of the users to all
		io.sockets.emit('nbUsers', {"nb": users});
		/*var remain_people  = pseudoArray.filter(x => left_people.indexOf(x) == -1); 
		io.sockets.emit('nbUsers', {"nb": users , "connected_user_names": remain_people });*/
}   



function pseudoSet(socket) { // Test if the user has a name
	var test;
	if (socket.nickname == null ) test = false;
	else test = true;
	return test;
}