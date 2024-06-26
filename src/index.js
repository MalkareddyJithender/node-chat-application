const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom,users} = require('./utils/users')


const app = express()

const server = http.createServer(app)
//connect socket.io to server
 const io = socketio(server)

const port = process.env.PORT || 3000

 const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket) =>
{
    console.log('new websocket connection!')

    io.emit('ActiveRooms',{users:users});
    
    socket.on('join',({username,room},callback) =>
    {
       const{error,user} =  addUser({id:socket.id,username,room})
       if(error)
       {
           return callback(error)
       }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', 
                {
                 room: user.room, 
                 users: getUsersInRoom(user.room)
                })
        callback()
    })

    socket.on('sendmessage',(message,callback) =>
    {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message))
        {
            return callback('The profane words are not allowed!')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(coords,callback) =>
    {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) 
        callback()
    })

    socket.on('disconnect',() =>
    {
       const user =  removeUser(socket.id)

       if(user)
       {
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
       }
    })
})

server.listen(port,() =>
{
    console.log('server is up on port',port)
})
