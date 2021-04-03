const app = require('./app');

const PORT = process.env.PORT || 3000;
//app.set('port', PORT);

//const server = require('http').createServer(app);
const server = app.listen(PORT);
const io = require('socket.io')(server);
const socket_controller = require('./socketController');


io.on('connection', socket_controller(io));

const { PeerServer  } = require('peer');
const PeerHost = process.env.PEER_HOST || 'localhost';
const PeerPort = process.env.PEER_PORT || 443;
const PeerPath = process.env.PEER_PATH || '/myapp';
const peerServer = PeerServer({ port: PeerPort, path: PeerPath });

peerServer.on('connection', ({ id }) => {
    console.log(`User ${id} connected ... `);
});

peerServer.on('disconnect', ({ id }) => {
    console.log(`User ${id} disconnected ... `);
});



//server.listen(PORT, () => console.log('server running'));
