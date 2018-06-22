var exampleSocket = new WebSocket("ws://" + location.hostname + ":3000/", []);

exampleSocket.onerror = function (event) {
  alert('Error websocket ' + event.message)
}

exampleSocket.onclose = function (event) {
  var res = document.querySelector('.res')
  res.innerHTML = '<b>😫 Lost connection</b>' + res.innerHTML
}

window.clear = function() {
  document.querySelector('.res').innerHTML = ''
}

exampleSocket.onmessage = function (event) {
  var res = document.querySelector('.res')
  var data = JSON.parse(event.data)
  var string = JSON.stringify(data, null, 2)
  if (data.progress === 0) {
    res.innerHTML = '<hr />' + res.innerHTML
  }
  res.innerHTML = '<pre class="ws-message ' + event.type + '">' + string +'</pre>' + res.innerHTML
  console.log(string);
}

function send (data) {
    exampleSocket.send(JSON.stringify(data))
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

if ($) {
  $(document).ready(function () {
    console.info('called');
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


