
var messageContainer, submitButton , timeout;
var pseudo = "";
var socket = io.connect();

  
$(function() {  
	hide("main_container");
	hide("typing_on"); 
	messageContainer = $('#comment');
	submitButton = $("#submit");
	window.setInterval(time, 1000*10);
	$("#alertPseudo").hide();
	open_this_modal("user_details_modal");
	focus_this("pseudoInput");
	$("#pseudoSubmit").click(function() {
		setPseudo();
	}); 
	
	submitButton.click(function(){
			sentMessage();
	}); 

	$('#comment').keypress(function (e) {
		if (e.which == 13){
				sentMessage();
		}
	}); 
	
	$('#pseudoInput').keypress(function (e) {
		if (e.which == 13){
				setPseudo();
		}
	});
	
	$('#comment').keyup(function() {
    typing = true;
    socket.emit('typing', 'typing...');
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 2000);
});
 
   
 $('#imagefile').bind('change', function(e){
      var data = e.originalEvent.target.files[0];
      var c_img_size = data.size ;
      if( c_img_size > 1048576 ){ // > 1MB
      	alert("It's "+bytesToSize(c_img_size)+". Max 1MB allowed");
      }else{     
	      var reader = new FileReader();
	      reader.onload = function(evt){
	        set_image('me', evt.target.result, true);
	        socket.emit('user_image', evt.target.result );
	      };
	      reader.readAsDataURL(data);
      }   
      
}); 

	
});  

socket.on('connect', function() {
	console.log('connected');
}); 

 
function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
}  

socket.on('typing', function(data) {
    if (data) { 
       show("typing_on");
    } else {   
    	hide("typing_on");
    } 
});



socket.on('nbUsers', function(msg) {
	var no_of_conneted_people = msg.nb -1 ; 
	if(no_of_conneted_people != 0  ){
		sval("no_of_connection","Connected with "+no_of_conneted_people+" people","text");	
	}else{    
		sval("no_of_connection","Not Connected with any people","text");
	}  
});    


function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return parseFloat(bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}; 
 
function set_connected_with(all_people){
	 var my_name = val("connected_user_name","text");
	 var im_connected_with = remove_this_from_list(all_people,my_name);
	 if(im_connected_with.length > 0 ){
	 	return "["+im_connected_with.join(", ")+"]";
	 }else{ 
	 	return "";
	 } 
}    

socket.on('message', function(data) {
	addMessage(data['message'], data['pseudo'], c_time() , false);
});

socket.on('user_image', function(data) {
	set_image(data['pseudo'],data['message'],false);
}); 

socket.on('join_left', function(data) {
	join_left_msg(data);
});  
   
 
function open_this_image(this_src){
	open_this_modal("image_viewer");
	$("#open_image_here").prop('src',this_src);
}   


function set_image (from, base64Image, self) {
	
	if(self){
		var classDiv = "message-main-sender";
		var sender_rcvr_class= "sender" ;
		var msg_with_dom = "";
	} else{
		var classDiv = "message-main-receiver";
		var sender_rcvr_class= "receiver" ;
		var msg_with_dom = '<span class="msg_with_name">'+from+'</span>';
	}
 	   
    var img_dom = '<img onclick="open_this_image(this.src);" class="sent_image pointer" src="' + base64Image + '"/>';
    
    var chat_dom = '<div class="row message-body">'
				+ '<div class="col-sm-12 '+classDiv+' ">'
	            +'  <div class="'+sender_rcvr_class+'">'
	            + msg_with_dom
                +'<div class="message-text">'
                + img_dom 
                +'</div>'
                +'<span class="message-time pull-right">'
                + c_time()
                +'</span>'   
              +'</div>'
             +'</div>'
           +'</div>' ;
	
	$("#conversation").append(chat_dom);
	scroll_to_bottom("conversation");
	time(); 
	
	
}   

function join_left_msg(this_msg){
	 var chat_dom = '<div class="row message-body">'
					+ '<div class="col-sm-12 center_msg  "><strong>'
		           	+this_msg 
		             +'</strong></div>'
		           +'</div>' ;
 	$("#conversation").append(chat_dom);
	scroll_to_bottom("conversation");
	time(); 
} 
 

//Help functions
function sentMessage() {
	var msg_text = messageContainer.val().trim();
	if (msg_text  != "") 
	{
		if (pseudo == "") 
		{ 
			open_this_modal("user_details_modal");
		}
		else 
		{
			socket.emit('message', msg_text );
			addMessage(msg_text , "Me", c_time(), true);
			messageContainer.val(''); 
		} 
	}
} 

function addMessage(msg, pseudo, date, self) {
 
	if(self){
		var classDiv = "message-main-sender";
		var sender_rcvr_class= "sender" ;
		var msg_with_dom = "";
	} else{
		var classDiv = "message-main-receiver";
		var sender_rcvr_class= "receiver" ;
		var msg_with_dom = '<span class="msg_with_name">'+pseudo+'</span>';
	}
	  
	var chat_dom = '<div class="row message-body">'
				+ '<div class="col-sm-12 '+classDiv+' ">'
	            +'  <div class="'+sender_rcvr_class+'">'
	            +msg_with_dom
                +'<div class="message-text">'
                + msg
                +'</div>'
                +'<span class="message-time pull-right">'
                + date
                +'</span>'  
              +'</div>'
             +'</div>'
           +'</div>' ;
	//$("#conversation").append('<div class="'+classDiv+'"><p class="infos"><span class="pseudo">'+pseudo+'</span>, <time class="date" title="'+date+'">'+date+'</time></p><p>' + msg + '</p></div>');
	
	$("#conversation").append(chat_dom);
	scroll_to_bottom("conversation");
	time(); 
}   


function setPseudo() {
	if ($("#pseudoInput").val() != "")
	{
		var c_user_name = val("pseudoInput");
		socket.emit('setPseudo', c_user_name); 
		sval("connected_user_name",c_user_name,"text");
		socket.on('pseudoStatus', function(data){
			console.log(data);
			if(data == "ok")
			{
				close_this_modal("user_details_modal");
				$("#alertPseudo").hide();
				pseudo = $("#pseudoInput").val();
				focus_this("comment");  
 			} 
			else
			{
				$("#alertPseudo").slideDown();
			}
		})
	}
}

function time() {
	$("time").each(function(){
		$(this).text($.timeago($(this).attr('title')));
	});
}

// Common JS functions

function c_time(){
	var today = new Date();
	var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return  date+' '+t24to12(time);  
} 
 

 function focus_this(this_input){
   	$input = $("#"+this_input);
   	$input.focus();        
   	var focus_last = $input.val();   
		 $input.val(''); 
		 $input.val(focus_last+" ");  
 }

function scroll_to_bottom (id) {
   var div = document.getElementById(id); 
   $('#' + id).animate({
      scrollTop: div.scrollHeight - div.clientHeight
   }, 400); 
}   
 

function close_this_modal(modal_id){ 
 		$('#'+modal_id).removeClass("in");
		$(".modal-backdrop").remove();
		$('body').removeClass('modal-open');
		$('#'+modal_id).attr('aria-hidden', true);
		$('#'+modal_id).off('click.dismiss.modal');
		$('#'+modal_id).modal('hide');
		$('#'+modal_id).hide();
		$('#'+modal_id).trigger('reveal:close'); 
		$('#'+modal_id).modal({ show: false})
		$('#'+modal_id).removeData('bs.modal')
		show("main_container",400);
}   

 
function open_this_modal(this_id){
 	 $('#'+this_id).modal('show');
	 $('#'+this_id).trigger('reveal:open');
}  
  
function array_unique(names){  
	var uniqueNames = [];
	$.each(names, function(i, el){
	    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
	}); 
	 
	return uniqueNames ; 
}   
 
function today_date(){
	today_date_pass = new Date();   
	return (today_date_pass.getMonth() + 1) + "/" + today_date_pass.getDate() + "/" + today_date_pass.getFullYear();
}       
	   
	 
   
function date_difference(start_date,end_date){
	var date1 = new Date(start_date);
	var date2 = new Date(end_date);
	return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)); 
} 
 
function remove_this_from_list(arr, value) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] === value) {
            arr.splice(i, 1);
            break; 
        } 
    }  
    return arr; 
}  
 
function cl(print_this){
	return console.log(print_this); 
}   
      
function is_empty(this_id){
	if((val(this_id) == '') || (val(this_id) == null) ){
		return true;
	}else{
		return false; 
	}   
}   
 
       
function val(this_id,type){
	if (type === undefined) {
		return $( "#"+this_id).val();
	}else if(type == 'text' ){
    	return $( "#"+this_id).text();
    }else if(type == 'html' ){ 
    	return $( "#"+this_id).html();
    } 
} 
 
function hide(this_id,speed){ 
	if (speed === undefined) {
		return $( "#"+this_id).hide();	
	}else{ 
		return $( "#"+this_id).hide(speed);	
	}
	
}   
 
function show(this_id,speed){ 
	if (speed === undefined) {
		return $( "#"+this_id).show();	
	}else{ 
		return $( "#"+this_id).show(speed);	
	}
	
	
} 
  
function sval(this_id,set_this_val,type){
	if (type === undefined) {
       return $( "#"+this_id).val(set_this_val);
    }else if(type == 'text' ){
    	return $( "#"+this_id).text(set_this_val);
    }else if(type == 'html' ){ 
    	return $( "#"+this_id).html(set_this_val);
    }     
}    
   
	

function t24to12(c_time) {
	 entire_time = c_time.split(':');
	 hours = entire_time[0];
	  minutes = entire_time[1];
    var time = null;
    minutes = minutes + "";
    if (hours < 12) {time = "AM";}
    else {  time = "PM";}
    if (hours == 0) {hours = 12;}
    if (hours > 12) {hours = hours - 12; }
    if (minutes.length == 1) {minutes = "0" + minutes;}
    return hours + ":" + minutes + " " + time;
}









