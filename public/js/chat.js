const socket = io()
//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput =document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageFormLocationButton = document.querySelector('#location-button')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML 

//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () =>
{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrolloffset = $messages.scrollTop + visibleHeight
  
    if (containerHeight - newMessageHeight <= scrolloffset) 
    {     
         $messages.scrollTop = $messages.scrollHeight    
    }
}

socket.on('message',(message) =>
{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location) =>
{
    const html = Mustache.render(locationTemplate,{
        username:location.username,
        url:location.url,
        createdAt:moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
   autoscroll() 
})

socket.on('roomData', ({ room, users }) => { 
        const html = Mustache.render(sidebarTemplate, {room,users}) 
        document.querySelector('#sidebar').innerHTML = html 
    }) 

$messageForm.addEventListener('submit',(e) =>
{
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')
   
     const message = e.target.elements.message.value
   socket.emit('sendmessage',message,(error) =>
   {
       //enable
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()

       if(error)
       {
      return console.log(error)
       }

       console.log('message delivered!')
   })
})

$messageFormLocationButton.addEventListener('click',() =>
{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser!')
    }

    $messageFormLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) =>
    {

       socket.emit('sendLocation',{
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
       },() =>
       {
           $messageFormLocationButton.removeAttribute('disabled')
           console.log('Location shared!')
       })
    })
})

socket.emit('join',{username,room},(error) =>
{
      if(error)
      {
          alert(error)
          location.href = '/'
      }
})