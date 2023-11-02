const socket = io();
let user;
let chatBox = document.getElementById('chatBox');

socket.on('newUserConnected', data => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${data.email} se ha unido al chat`,
        showConfirmButton: false,
        timer: 10000
    })
});

fetch('/api/sessions/currentuser')
  .then(response => response.json())
  .then(data => {
    user = data.user; 
    let title = document.getElementById('title');
    title.innerHTML = `Bienvenido ${user.email} a Flowery 4107 Webchat!`;
    socket.emit('authenticated', user);
  })
  .catch(error => {
    console.error('Error fetching current user:', error);
  });   

chatbox.addEventListener('keyup', evt => {
    if (evt.key === "Enter") {
        if (chatbox.value.trim().length > 0) {
            socket.emit('message', { user: user, message: chatbox.value });
            chatbox.value = "";
        }
    }
})

socket.on('messageLogs', data => {
    if (!user) return;
    let log = document.getElementById('messageLogs');
    let messages = "";
    data.forEach(message => {
        messages += `${message.user} dice: ${message.message}<br/>`
    })
    log.innerHTML = messages;
})

