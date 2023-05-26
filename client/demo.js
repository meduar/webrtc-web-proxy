/* eslint-env browser */

var payload;

const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
})
const log = msg => {
  document.getElementById('logs').innerHTML += msg + '<br>'
}

const sendChannel = pc.createDataChannel('foo')
sendChannel.onclose = () => console.log('sendChannel has closed')
sendChannel.onopen = () => console.log('sendChannel has opened')
sendChannel.onmessage = e => log(`Message from DataChannel '${sendChannel.label}' payload '${e.data}'`)

pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)
pc.onicecandidate = event => {
  if (event.candidate === null) {
    //document.getElementById('localSessionDescription').value = btoa(JSON.stringify(pc.localDescription))
    payload = {sdp: btoa(JSON.stringify(pc.localDescription))};

    callSignal()
  }
}

pc.onnegotiationneeded = e =>
  pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log)

window.sendMessage = () => {
  const message = document.getElementById('message').value
  if (message === '') {
    return alert('Message must not be empty')
  }

  sendChannel.send(message)
}

window.startSession = () => {
  var sd = ""//document.getElementById('remoteSessionDescription').value

  //
  var count = 5;

  printWithDelay();

  function printWithDelay() {
    setTimeout(function() {
      
      //
      fetch("http://localhost:8000/getServerMessage")
      .then((res) => { 
        console.log("Waiting fro message from the server");
        return res.json();
        //sd = res;        
      })
      .then(function(data){ 

        console.log("data is empty", data);

        if(data) {
          //sd = JSON.stringify(data);
          try {
            console.log("Data data", data);
            //pc.setRemoteDescription(JSON.parse(atob(sd)));
            pc.setRemoteDescription(JSON.parse(atob(data)));
          } catch (e) {
            alert(e);
          }
        } else {
          printWithDelay();
        }

      })

      console.log("trying to connect");
      //
     
    }, 1000);
  };
  //

  if (sd === '') {
    //return alert('Session Description must not be empty')
  }

  
}

window.copySDP = () => {
  const browserSDP = document.getElementById('localSessionDescription')

  browserSDP.focus()
  browserSDP.select()

  try {
    const successful = document.execCommand('copy')
    const msg = successful ? 'successful' : 'unsuccessful'
    log('Copying SDP was ' + msg)
  } catch (err) {
    log('Unable to copy SDP ' + err)
  }
}

function callSignal() {
  var data = new FormData();
  data.append( "json", JSON.stringify( payload ) );

  fetch("http://localhost:8000/setMessage",
  {
    method: "POST",
    headers: {'Accept': 'application/json'},
    body: JSON.stringify( payload )
  })
  .then(function(res){ 
    setTimeout(function() {
      window.startSession();
    }, 5000);
    return res.json(); 
  })
  .then(function(data){ console.log("First reponse", JSON.stringify( data ) ) })

  
}
