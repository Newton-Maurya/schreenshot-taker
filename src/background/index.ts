chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.set({ isClicked: false }, () => {})
  chrome.storage.sync.set({lastImage: ""}, () => {})
}
)

var clickCounter: number = 0;

var recordId: string = ''

function b64toBlob(b64Data: any, contentType: any) {
  contentType = contentType || ''
  let sliceSize: number = 512

  var byteCharacters = atob(b64Data)
  var byteArrays = []

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize)

    var byteNumbers = new Array(slice.length)
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    var byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  var blob = new Blob(byteArrays, { type: contentType })
  return blob
}




chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
  if (request.name == 'screenshot') {
      chrome.tabs.captureVisibleTab( function(dataUrl) {
          sendResponse({ screenshotUrl: dataUrl});
      });
  } 
  if(request.name === "Record Click") {
    clickCounter++
    chrome.browserAction.setBadgeText({text: `${clickCounter}`})
    chrome.tabs.captureVisibleTab(async function(dataUrl) {

      var block = dataUrl.split(';')
    var contentType = block[0].split(':')[1]
    
    var realData = block[1].split(',')[1]

    // Convert to blob

    var blob = b64toBlob(realData, contentType)

    // Create a FormData and append the file
    var fd = new FormData()
    fd.append('screenshot', blob)
    fd.append('isPosition', 'true')
    fd.append('positionX', request.Xcoordinate)
    fd.append('positionY', request.Ycoordinate)
    fd.append('recordName', request.title)
    
    if(clickCounter === 1) {
      recordId = `nmcHJs${Date.now()}`
      fd.append('recordId', recordId)
      handleNewRecord(fd)
    }
    else {
      fd.append('recordId', recordId)
      handleExistingRecord(fd)
    }

    })
  }
  if(request.name === "Start Recording") {
    screenRecording()

  }
  if(request.name === "Stop Clicks") {
    clickCounter = 0
    chrome.browserAction.setBadgeText({
      'text': '' 
    });
    sendResponse({recordId: recordId})

  }

  return true;
});
 

// take screen recording
function screenRecording() {
  chrome.desktopCapture.chooseDesktopMedia(['screen', 'audio'],
    function onAccessApproved(id) {
      let recordedChunks: any = [];
      const constraints = {
        "video": {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: id,
            minWidth: 1280,
            minHeight: 720,
            maxWidth: 1280,
            maxHeight: 720
          }
        },
        "audio": false
      };
      // @ts-ignore
      navigator.mediaDevices.getUserMedia(constraints).then(gotMedia).catch(e => {
        console.error('getUserMedia() failed: ' + e);
      });

      function gotMedia(stream: any) {
        var theStream = stream;
        var binaryData = [];
        var recorder
        var theRecorder: any
        binaryData.push(stream);
        try {
          recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        } catch (e) {
          console.error('Exception while creating MediaRecorder: ' + e);
          return;
        }

        theRecorder = recorder;
        recorder.ondataavailable =
          (event) => { recordedChunks.push(event.data); };
        recorder.start(100);


        stream.getVideoTracks()[0].onended = function () {
          handleRecordedStream(theStream, theRecorder);
        };
      }


     async function handleRecordedStream(theStream: any, theRecorder: any) {
        theRecorder.stop();
        theStream.getTracks().forEach((track: any) => { track.stop(); });

        var blob = new Blob(recordedChunks, { type: "video/webm" });

        const file = new File([blob], 'recording')
        
        const formData = new FormData();

        formData.append('screenshot', file);

        const requestOptions = {
          method: 'POST',
          body: formData,
        }
        const response = await fetch(
          'http://localhost:2000/save-video',
          requestOptions,
        )
        const data = await response.json()


      }
    })
}


const handleNewRecord = async (formData: any) => {
  const requestOptions = {
    method: 'POST',
    body: formData,
  }
  const response = await fetch(
    'http://localhost:2000/handle-new-record',
    requestOptions,
  )
  const data = await response.json()
}

const handleExistingRecord = async (formData: any) => {
  const requestOptions = {
    method: 'POST',
    body: formData,
  }
  const response = await fetch(
    'http://localhost:2000/handle-existing-record',
    requestOptions,
  )
  const data = await response.json()
}
