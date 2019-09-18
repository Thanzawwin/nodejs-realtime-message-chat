const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

//model
const Users = require('./model/Users');
const Message = require('./model/Message');

//db
const db = 'mongodb://localhost/realtime-chat';
mongoose
  .connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=> console.log('mongodb connected'))
  .catch((err)=> console.log('mongodb error'));

//static
app.use(express.static(path.join(__dirname,'public')));

//all message
async function allMessages(){
  try{
    let msgs = await Message.find({});
    let users = await Users.find({});

    io.emit('init',{msgs,users});
  }catch(err){
    console.log(err)
  }
}

//socket.io
io.on('connection',async (client)=>{
  //init
  allMessages()

  //message input
  client.on('send-msg',async (data)=>{
    const { username,message } = data;
    if(!username || !message ){
      //err
      io.emit('err',{msg:'Please fill in username && message fields'});
    }else{
      //save db
      try{
        let user = await Users.findOne({username});
        //if user is here
        if(user){
          let newMsg = new Message({
            userId:user._id,
            message:message
          })
          //save meg
          await newMsg.save();
          //send all message and users
          allMessages()
        }else{
          //not user
          let newUser = new Users({
            username
          })
          //save user
          await newUser.save()
          //set message
          let newMsg = new Message({
            userId:newUser._id,
            message:message
          })
          
          //save meg
          await newMsg.save();
          //send all message and users
          allMessages()
            
        }
        

      }catch(err){
        console.log(err)
      }
      
    }
  })

  //message single del
  client.on('msg-single-del',id =>{
    Message
      .deleteOne({_id:id})
      .then(data =>{
        //init
        allMessages()
      })
  })

  //all clear msg && user
  client.on('all-clear',()=>{
    //user
    Users.deleteMany({},(err)=>{
      if(err)throw err;
      console.log('user all clear');
      //init
      allMessages()
    })
    //message
    Message.deleteMany({},(err)=>{
      if(err)throw err;
      console.log('message all clear');
      //init
      allMessages()
    })
  })
  
  
})



//routes
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'public/index'));
})



//server
const port = process.env.PORT || 3000;
server.listen(port,()=> console.log(`Server is running on port ${port}`));