var socket=io();
function scrollToBottom(){
    var messages=jQuery('#messages');
    var newMessage=messages.children('li:last-child');
    var clientHeight=messages.prop('clientHeight');
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMessageheight=newMessage.innerHeight();
    var lastMessageheight=newMessage.prev().innerHeight();
    if(clientHeight+scrollTop+newMessageheight+lastMessageheight >= scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}


socket.on('connect',function(){
    console.log("connected to server");

         var prem= jQuery.deparam(window.location.search) ;
    socket.emit('join',prem,function(err){
        if(err){
               alert(err)
               window.location.href='/';
        }
        else{
              
        }
    })
})
socket.on('disconnect',function () {
    console.log('disconnected from server')
});

socket.on('updateUserList',function(list){
    console.log(list)
    var ol=jQuery('<ol></ol>');
       list.forEach(function(user){
           ol.append(jQuery('<li></li>').text(user));

       })
       jQuery('#users').html(ol)
})

socket.on('newMessage',function(message){
    var formattedTime=moment(message.createAt).format('h:mm a');
    var template=jQuery('#message-template').html();
    var html= Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formattedTime
    })
    jQuery('#messages').append(html);
    scrollToBottom();
    // console.log("new message",message);
    // var li= jQuery('<li></li>');
    // li.text(`${message.from}  ${formattedTime}: ${message.text}`);
    // jQuery('#messages').append(li);
})

socket.on('locationMessage',function(message){
    var formattedTime=moment(message.createAt).format('h:mm a');
    var template=jQuery('#location-message-template').html();
    var html= Mustache.render(template,{
        url:message.url,
        from:message.from,
        createdAt:formattedTime
    })
    jQuery('#messages').append(html);
    // var li= jQuery('<li><li/>');
    // var a =jQuery("<a target='_blank'>My Current Location</a>")
    // li.text(`${message.from}  ${formattedTime} :`);
    // a.attr('href',message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
    scrollToBottom();
})

jQuery('#message-form').on('submit',function (e){
  e.preventDefault();

  socket.emit('createMessage',{
       
      text:jQuery('[name=message]').val()
  },function(){
    jQuery('[name=message]').val('')
  });
})
 
var locationButton=jQuery('#send-location');
locationButton.on('click',function(){
    if(!navigator.geolocation){
        return alert("Geolocation not fetch by the browser")
    }
    locationButton.attr('disabled','disabled').text('Sending location...')
    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send location')
          socket.emit('currentLocationMessage',{
             latitude: position.coords.latitude,
             longitude:position.coords.longitude
          })
    },function(){
        locationButton.removeAttr('disabled').text('Send location')
        alert('Unable to fetch location')
    })
})