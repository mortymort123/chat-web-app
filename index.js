import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { saveUser, joinRoom, removeUser, removeUserInRoom } from './users.js';

const app = express();
const server = createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });
const io = new Server(server)
const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8080;



app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

io.on("connection", socket => {
    socket.on("join main lobby", (username, callback) => {
        socket.username = username;
        socket["Rooms"] = ["main lobby"];
        const { error } = saveUser(username);
        const { users } = joinRoom(username, "main lobby")

        if (error) return callback(error);

        socket.join("main lobby");
        io.to("main lobby").emit("joined user", { room: "main lobby", users: users })
        io.to("main lobby").emit("receive message", { room: "main lobby", username: "System", message: `${socket.username} has join the room` })

    })

    socket.on("join room", ({ room }) => {
        if (socket["Rooms"]) {
            socket["Rooms"].push(room);
            const { users } = joinRoom(socket.username, room)
            socket.join(room);
            io.to(room).emit("joined user", { room: room, users: users })
            io.to(room).emit("receive message", { room: room, username: "System", message: `${socket.username} has join the room` })
        }
    })

    socket.on("leave room", (room) => {
        const { users } = removeUserInRoom(socket.username, room)
        socket.to(room).emit("user leave", { room: room, username: socket.username, users: users })
        io.to(room).emit("receive message", { room: room, username: "System", message: `${socket.username} has left the room` })

    })

    socket.on("disconnect", (reason) => {
        if (socket.username) {
            console.log(`${socket.username} has disconnect, reason: ${reason}`)
            removeUser(socket.username);
            if (socket["Rooms"]) {
                socket["Rooms"].forEach(room => {
                    const { users } = removeUserInRoom(socket.username, room)
                    socket.to(room).emit("user leave", { room: room, username: socket.username, users: users })
                    io.to(room).emit("receive message", { room: room, username: "System", message: `${socket.username} has left the room` })
                })
            }
        }
    })

    socket.on("send message", ({ room, message }, callback) => {
        io.to(room).emit("receive message", { room: room, username: socket.username, message: message })
        callback();
    })

});

server.listen(PORT)
