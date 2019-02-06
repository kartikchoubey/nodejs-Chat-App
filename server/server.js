 const path =require("path");
 const express=require('express');
 const http =require("http");
 const socketIO=require("socket.io");
 var {message}=require("./utils/message");
 var moment=require('moment');
 var {isString}=require('./utils/validation')
 var {Users}=require('./utils/user'); 
 var users=new Users();

 const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname,'../public');
var app=express();
var server= http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));    

io.on('connection',(socket)=>{
    console.log("new user connected");

  
       
   socket.on('join',(params,callback)=>{
       if(!isString(params.name) || !isString(params.room)){
          return callback("NOT PROVIDED WITH PROPER ROOM AND NAME");
       }
      socket.join(params.room);
      users.removeUser(socket.id);
      users.addUser(socket.id,params.name,params.room);
      io.to(params.room).emit('updateUserList',users.getUserList(params.room));
      socket.emit('newMessage',message("Admin","Welocome to Chat app"));
   
      socket.broadcast.to(params.room).emit('newMessage',message("Admin","New User Join"))
   });

    socket.on("createMessage",(message,callback)=>{
       var user=users.getUser(socket.id);
       
       if(user && isString(message.text)){
        io.to(user.room).emit('newMessage',{
            from:user.name,
            text:message.text,
            createAt:moment.valueOf()
        })
       }
       
        callback();
    })

    socket.on('currentLocationMessage',(coords)=>{
        var user=users.getUser(socket.id);
       if(user){
          io.to(user.room).emit('locationMessage',{
                from:user.name,
                url:`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`,
                createtAt:moment.valueOf()
            })
        }
      
    })
     
    socket.on('disconnect',()=>{
        var user=users.removeUser(socket.id);
        
        if(user){
            io.to(user.room).emit('updateUserList',users.getUserList(user.room))
            io.to(user.room).emit('newMessage',{
                from:'Admin',
                text:`${user.name} has Left`,
                createtAt:moment.valueOf()
            })
        }
    })

});


server.listen(port,()=>{
    console.log(`Started on port ${port }`);
})