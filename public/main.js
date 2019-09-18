let server = io.connect()

//Dom
function _(data){
  return document.querySelector(data);
}

//init 
server.on('init',({msgs,users})=>{

    let li = '';
    for(let msg of msgs){
      li += `
        <div>
          <strong class="msg-chat">${users.find(u => u._id == msg.userId ).username}</strong>:
          ${msg.message}
          <span class="msg-del-btn" onclick="singleMsgDel('${msg._id}')">&times;</span>
        </div>
      `;
    }
    _('#show-msg').innerHTML = li;
})

//when send button click
_('#send-btn').addEventListener('click',e =>{

let username = _('#username').value;
let message = _('#wirte-msg').value;

//send server
server.emit('send-msg',{username,message});
//fields clear
_('#wirte-msg').value = '';
// _('#username').value = '';

})

//single msg del
function singleMsgDel(id){
  server.emit('msg-single-del',id);
}

//all user and message clear
_('#msg-clear').addEventListener('click',e =>{
  let conf = window.confirm('are your sure? || username && message fields all clear?');

  if(conf){
    server.emit('all-clear');
  }
})

//when error
server.on('err',({msg})=>{
  console.log(msg)
})