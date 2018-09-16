window.socket = {isFirstTime: true}
window.DEBUG = location.href.indexOf('debug') > -1
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

window.rows = {}
window.table = document.querySelector('.progress-table tbody')

function createRow (query, data, i) {
  var elem = document.createElement('tr')
  var id = i.toString()
  elem.id = 'row' + id
  var percent = Math.floor(1 / data.total)
  var progress = '<div class="progress"> <div class="progress-bar" role="progressbar" style="width: ' + percent + '%;" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100">' + percent + '%</div> </div>'
  var inner = '<th scope="row">' + id + '</th>'
  inner += '<td>' + query + '</td>'
  inner += '<td colspan="2">' + progress + '</td>'
  elem.innerHTML = inner
  return elem
}

window.COLLAPSED_EMAIL_CONTENT_LIMIT = 200

function updateRow (elem, data, count) {
  var len = elem.children.length
  var last = elem.children[len - 1]
  if (data.type === 'progress') {
    var percent = Math.floor((count / data.total) * 100)
    var content = '<div class="progress"> <div class="progress-bar" role="progressbar" style="width: ' + percent + '%;" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100">' + percent + '%</div> </div>'
  } else if (data.type === 'end') {
    var content = '<div class="collapsed">'
    var email_list_length = 0
    var moreEmails = false
    for (var email in data.emails) {
      if (email_list_length > window.COLLAPSED_EMAIL_CONTENT_LIMIT) {
        moreEmails = true
        break
      }
      content += email + ', '
      email_list_length += email.length
    }
    content = content.slice(0, content.length - 2)
    if (moreEmails) {
      content += ' ... '
    }
    if (email_list_length) {
      content += '&nbsp;<a href="#' + elem.id + '" onclick="expandRow(this)">See more [+]</a>'
    } else {
      content = '<span>None found</span>'
    }
    content += '</div>'
    content += '<div class="expanded" style="display: none">'

    for (var email in data.emails) {
      content += email
      content += '<ul>'

      for (var source in data.emails[email].sources) {
        var count = data.emails[email].sources[source]
        var url_split = source.split('://')
        var display_url = source

        for (var i = 0; i < url_split.length; i ++) {
          var split = url_split[i]
          if (split.indexOf('www.google') !== 0) {
            display_url = split
          }
        }

        display_url = display_url.split('&')[0]
        content += '<li>'
        content += '<div class="text-truncate d-inline-block" style="vertical-align: bottom; max-width: 250px; margin-right: 0.2rem;">'
        content += '<a target="_blank" href="' + source + '">' + display_url + '</a>&nbsp;'
        content += '</div>'
        content += '<div class="badge badge-secondary">' + count + '</div>'
        content += '</li>'
      }
      content += '</ul>'
    }
    content += '&nbsp;<a href="#" onclick="collapseRow(this)">See less [-]</a>'
    content += '</div>'
  }
  last.innerHTML = '<td colspan="2">' + content + '</td>'
  return elem
}

window.expandRow = function expandRow (event) {
  var target = event
  target.parentElement.style.display = 'none'
  var children = target.parentElement.parentElement.children
  children[children.length - 1].style.display = 'block'
}

window.collapseRow = function expandRow (event) {
  var target = event
  target.parentElement.style.display = 'none'
  var children = target.parentElement.parentElement.children
  children[0].style.display = 'block'
}

function handleProgress (data) {
  var query = data.query
  var rows = window.rows
  if (!rows[query]) {
    rows[query] = {index: table.children.length, completeCount: 1}
    var id = table.children.length
    var elem = createRow(query, data, id)
    table.appendChild(elem)
    updateRow(elem, data, rows[query].completeCount)
  } else {
    var elem = table.children[rows[query].index]
    rows[query].completeCount += 1
    updateRow(elem, data, rows[query].completeCount)
  }
}

socket.onmessage = function (event) {
  var res = document.querySelector('.res')
  var data = JSON.parse(event.data)
  var string = JSON.stringify(data, null, 2)
  if (data.progress === 0) {
    res.innerHTML = '<hr />' + res.innerHTML
  }


  var query = data.query

  if (query) {
    handleProgress(data)
  }

  if (event.type !== 'progress') return
  res.innerHTML = '<pre class="ws-message ' + event.type + '">' + string +'</pre>' + res.innerHTML
  // console.log(data);
}

// handleProgress({type: 'progress', query: 'test', total: 5, progress: 1})
// handleProgress({type: 'progress', query: 'test', total: 5, progress: 1})
// handleProgress({type: 'progress', query: 'test', total: 5, progress: 1})
// handleProgress({type: 'progress', query: 'test', total: 5, progress: 1})
// handleProgress({type: 'progress', query: 'test', total: 5, progress: 1})
// var data = {
//   "type": "end",
//   "query": "test",
//   "emails": {
//     "mail@campbell-online.co.uk": {
//       "count": 10,
//       "sources": {
//         "https://www.google.co.uk/url?q=http://www.campbell-online.co.uk/contact-us/&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFggaMAE&usg=AOvVaw0cT0mfw78VHCvMk0tGdxRw": 1,
//         "https://www.google.co.uk/url?q=http://www.campbell-online.co.uk/contact-mobile/&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFgggMAI&usg=AOvVaw0BvzYOijpq0NmP9XgfzP4A": 1,
//         "https://www.google.co.uk/url?q=https://www.rightmove.co.uk/estate-agents/agent/Campbells/Head-Office-20669.html&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFgg9MAc&usg=AOvVaw283SL0fbU_E_gz2_CBTOOs": 1
//       }
//     },
//     "media@campbellsoup.com": {
//       "count": 2,
//       "sources": {
//         "https://www.google.co.uk/url?q=https://www.campbellsoupcompany.com/newsroom/media-contact/&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFggrMAQ&usg=AOvVaw0rrLXriyb73ABu4FFIISOK": 1
//       }
//     },
//     "sales@campbellsci.co.uk": {
//       "count": 3,
//       "sources": {
//         "https://www.google.co.uk/url?q=https://www.campbellsci.eu/contact&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFggxMAU&usg=AOvVaw1ZmUHSLWrlKAdX3TfbdaZL": 1
//       }
//     },
//     "support@campbellsci.co.uk": {
//       "count": 3,
//       "sources": {
//         "https://www.google.co.uk/url?q=https://www.campbellsci.eu/contact&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFggxMAU&usg=AOvVaw1ZmUHSLWrlKAdX3TfbdaZL": 1
//       }
//     },
//     "campbellal@parliament.uk": {
//       "count": 2,
//       "sources": {
//         "https://www.google.co.uk/url?q=http://www.alancampbellmp.co.uk/contact_details&sa=U&ved=0ahUKEwiiivrgnPnbAhXjLcAKHbTTCycQFghCMAg&usg=AOvVaw1kioOGHShgJXDQvJYLYU11": 1
//       }
//     }
//   },
//   "wsClientId": "wsid:1"
// }
// handleProgress(data)

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


