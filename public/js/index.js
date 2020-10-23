const socket = io();

//elements
const $activeRooms = document.querySelector('#active-rooms');

//templates

const activeRoomsTemplate = document.querySelector('#activerooms-template').innerHTML;

socket.on('ActiveRooms',({users}) =>
{
    console.log(users);
    const html = Mustache.render(activeRoomsTemplate,{users});
    $activeRooms.innerHTML=html;
});