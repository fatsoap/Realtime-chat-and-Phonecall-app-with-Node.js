const express = require('express');
const app = express();


const { v4: uuidv4 } = require('uuid');
const path = require('path');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); 

const PeerHost = process.env.PEER_HOST || 'localhost';
const PeerPort = process.env.PEER_PORT || 443;
const PeerPath = process.env.PEER_PATH || '/myapp';


app.get('/', (req, res) => {
    res.render('login');
});

app.post('/', (req, res) => {
    res.redirect(`/server?serverId=${req.body.serverId}&username=${req.body.usename}`);
})

app.get('/server', (req, res) => {
    res.render('server', { 
        serverId: req.query.serverId,
        username: req.query.username,
        peer_host: PeerHost,
        peer_port: PeerPort,
        peer_path: PeerPath,
    });
})

module.exports = app;

