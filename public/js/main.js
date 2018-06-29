window.socket = {isFirstTime: true}
function connectToWebSocket () {
  window.socket = new WebSocket("ws://" + location.hostname + ":3000/", []);
}

function retryConnectWebSocket () {
  if (socket.isFirstTime || socket.readyState !== socket.OPEN) {
    connectToWebSocket()
    setTimeout(retryConnectWebSocket, 1000)
  } else {
    console.log('now connected')
    onConnected()
  }
}
retryConnectWebSocket()

socket.onerror = function (event) {
  alert('Error websocket ' + event.message)
}

socket.onclose = function (event) {
  var res = document.querySelector('.connection-info')
  res.innerHTML = '<b>😫 Lost connection</b>'
  retryConnectWebSocket()
}

function onConnected () {
 var res = document.querySelector('.connection-info')
 res.innerHTML = '<b>🎉 Connected!</b>'
}

window.clear = function() {
  document.querySelector('.res').innerHTML = ''
}

socket.onmessage = function (event) {
  var res = document.querySelector('.res')
  var data = JSON.parse(event.data)
  var string = JSON.stringify(data, null, 2)
  if (data.progress === 0) {
    res.innerHTML = '<hr />' + res.innerHTML
  }
  res.innerHTML = '<pre class="ws-message ' + event.type + '">' + string +'</pre>' + res.innerHTML
  console.log(data.type);
}

function send (data) {
  socket.send(JSON.stringify(data))
}

setTimeout(() => {
  var value = document.querySelector('input').value
  value && send({path: '/api/v1/search/email', query: value})
}, 200)

function onChangeString(event) {
  send({path: '/api/v1/search/email', query: event.target.value})
}

function onStartBatch (batchId) {
  send({path: '/api/v1/batch_progress', query: batchId})
}

if (window.$) {
  $(document).ready(function () {
    $("#drop-area").dmUploader({
      url: '/api/v1/search/emailBatch',

      onInit: function(){
        console.log('Callback: Plugin initialized');
      },

      onUploadProgress: function (id, progress) {
        console.info('progress', id, progress);
      },

      onUploadSuccess: function (id, data) {
        console.info('success', id, data);
        onStartBatch(data.batchId)
      },

      onUploadError: function (id, data) {
        console.info('error', id, data);
      }
    });
  })
}


