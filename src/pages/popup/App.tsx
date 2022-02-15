import React, { useState, FC, useEffect } from 'react'
// import axios from 'axios'

const style = {
  main: {
    width: '600px',
  },
}

const App: FC<any> = () => {
  const [isClickStart, setClickStart] = useState<boolean>(false)
  const [imageString, setImageString] = useState('')
  useEffect(() => {
    chrome.storage.sync.set({ isClicked: isClickStart }, () => {})
  }, [isClickStart])

  useEffect(() => {
    if (imageString.length > 100) {
      handleScreenshot()
    }
  }, [imageString])

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

  const handleScreenshot = async () => {
    var block = imageString.split(';')
    var contentType = block[0].split(':')[1]

    var realData = block[1].split(',')[1] 

    var blob = b64toBlob(realData, contentType)

    var fd = new FormData()
    fd.append('screenshot', blob)

    const requestOptions = {
      method: 'POST',
      body: fd,
    }
    const response = await fetch(
      'http://localhost:2000/record-screenshot',
      requestOptions,
    )
    const data = await response.json()
    console.log('data', data)
  }
  const takeScreenshot = () => {
    // chrome.tabs.query(
    //   { active: true, currentWindow: true },
    //   function (tabs: any) {
    //     chrome.tabs.sendMessage(
    //       tabs[0].id,
    //       { type: 'getText' },
    //       function (response) {
    //         chrome.storage.sync.get('imageString', (data) => {
    //           console.log('data the dta tatataa', data.imageString)
    //         })
    //       },
    //     )
    //   },
    // )
    chrome.runtime.sendMessage({ name: 'screenshot' }, (res) => {
      let resString = res.screenshotUrl ? res.screenshotUrl : ''
      setImageString(resString)
    })
  }

  const recordScreen = () => {
    chrome.runtime.sendMessage({ name: 'Start Recording' })
  }

  const stopClicks = (isStop: boolean) => {
    setClickStart(isStop)
    chrome.runtime.sendMessage({ name: 'Stop Clicks' })
  }

  // const hanldeClick = () => {
  //   chrome.runtime.sendMessage(
  //     'Hello Newton From background script',
  //     (responce) => {
  //       console.log('Responce of backgound script', responce)
  //       alert('Responce from background script')
  //     },
  //   )
  // }
  // window.addEventListener('click', () => {
  //   console.log('inside Window listener', isClickStart)
  //   if (isClickStart) {
  //     alert('Click button clicked')
  //   }
  // })

  // document.body.addEventListener('click', () => {
  //   alert('Hello Newton!')
  // })
  return (
    <div style={style.main}>
      {imageString.length > 0 ? (
        <img
          src={imageString}
          alt="sreenshot"
          style={{ width: '600px', height: '300px' }}
        />
      ) : (
        <>
          <div>
            <h2 className="heading">Record</h2>
            <p className="paraInstruction">
              Take screenshots or start recording of the screen. And also you
              can record the clicks.
            </p>
          </div>
          <div className={'buttonContainer'}>
            <button className={'containerBtn'} onClick={() => takeScreenshot()}>
              Take Screenshot
            </button>
            <button className={'containerBtn'} onClick={() => recordScreen()}>
              Start Recording
            </button>
            <button
              className={'containerBtn'}
              onClick={() => stopClicks(false)}
            >
              Stop Clicks
            </button>
            <button
              className={'containerBtn'}
              onClick={() => setClickStart(true)}
            >
              Record Clicks
            </button>
          </div>{' '}
        </>
      )}
    </div>
  )
}

export default App
