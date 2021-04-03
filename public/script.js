const socket = io('/');
const videoGrid = document.getElementById('video-grid');
var SECURE = true;
if(PEER_HOST === 'localhost') SECURE = false;
const myPeer = new Peer( {
  secure: SECURE,
  host: PEER_HOST,
  port: PEER_PORT,
  path: PEER_PATH
});


const peers = {};
const openVideo = false;
var myStream = null;
const ROOM_ID = SERVER_ID + "room";
var USER_ID;

//get media from user browser
function getMedia(includeVideo, includeAudio) {
  navigator.mediaDevices.getUserMedia({
    video: includeVideo,
    audio: includeAudio
  }).then(stream => {
    myStream = stream;
  }).catch( err => {
    console.log(err);
    alert('no permission to access audio');
  });
}

getMedia(false, true);


// peer server connected, then connected to chat server
myPeer.on('open', id => {
  USER_ID = id;
  socket.emit('join-server', SERVER_ID, USERNAME);
});

//new user got call from old user
myPeer.on('call', call => {

  //old user ID
  var userId = call.peer;

  if(!peers[userId]){

    //answer self stream
    call.answer(myStream);

    const video = document.createElement('video');

    //new user recieve old user stream
    call.on('stream', (userVideoStream) => { //old user stream
      addVideoStream(video, userVideoStream);
      peers[userId] = call;
    });

    //remove video after old user close
    call.on('close', () => {
      video.remove();
      peers[userId] = null;
    });    
  } 
});

//old user recieve new user's emit
socket.on('join-room', userId => {
  if(!peers[userId]) {
    connectToNewUser(userId);
  }
});  
  
//old user recieve user leave
socket.on('leave-room', userId => {
  if (peers[userId]) peers[userId].close();
});

//old user recieve new user join server
socket.on('user-connected', userId => {
  var item = document.createElement('li');
  item.textContent = `User ${userId} connected to server ${SERVER_ID}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

//old user recieve user leave
socket.on('user-disconnected', userId => {
  var item = document.createElement('li');
  item.textContent = `User ${userId} disconnected`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  if (peers[userId]) {
    peers[userId].close();
    peers[userId] = null;
  }
});


document.getElementById("join-room-audio").addEventListener("click", joinRoomAudio);
document.getElementById("join-room-video").addEventListener("click", joinRoomVideo);
document.getElementById("leave-room").addEventListener("click", leaveRoom);

//join room in server with video
function joinRoomVideo() {
  getMedia(true, true);
  socket.emit('join-room', ROOM_ID, USER_ID);
}

//join room in server without video
function joinRoomAudio() {
  getMedia(false, true);
  socket.emit('join-room', ROOM_ID, USER_ID);
}

function leaveRoom() {
  socket.emit('leave-room', ROOM_ID, USER_ID);
  for (var userId in peers) {
    if(peers[userId]) peers[userId].close();
    peers[userId] = null;
  }
}

//old user connect to new user
function connectToNewUser(userId) {

  //call new user with old user stream
  const call = myPeer.call(userId, myStream);

  const video = document.createElement('video');

  //new user's answer
  call.on('stream', userVideoStream => { //new user stream
    addVideoStream(video, userVideoStream);
    peers[userId] = call;
  });

  //remove video after new user close
  call.on('close', () => {
    video.remove();
    peers[userId] = null;
  });

}

//add video stream
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

//get send message DOM elements
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

//send message to users in server
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if(input.value) {
      socket.emit('chat-message', SERVER_ID, USER_ID, `${USERNAME} : ${input.value}`);
      var item = document.createElement('li');
      item.textContent = input.value;
      item.className = "self-msg";
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
      input.value = '';
    }
});

//recieve message from server
socket.on('chat-message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
