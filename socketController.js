function controller(io) {
    return function(socket)  {
        socket.on('join-server', (serverId, username) => {
            socket.join(serverId);
            socket.to(serverId).emit('user-connected', username);

            socket.on('disconnect', () => {
                socket.to(serverId).emit('user-disconnected', username);
            });
        });

        socket.on('chat-message', (serverId, userId, message) => {
            socket.to(serverId).emit('chat-message', message);
        });

        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit('join-room', userId);
        });

        socket.on('leave-room', (roomId, userId) => {
            socket.leave(roomId);
            socket.to(roomId).emit('leave-room', userId);
        });
    }
}

module.exports = controller;