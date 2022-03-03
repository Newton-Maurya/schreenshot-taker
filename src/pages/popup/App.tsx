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
  const [isRecordLoading, setIsRecordLoading] = useState(false)
  const [showRecords, setShowRecords] = useState(false)
  const [records, setRecords] = useState<
    { imgSrc: string; recordId: string; recordName: string; time: string }[]
  >([])
  console.log(document.title, 'document.title')
  useEffect(() => {
    chrome.storage.sync.set({ isClicked: isClickStart }, () => {})
  }, [isClickStart])

  useEffect(() => {
    if (imageString.length > 100) {
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

  const handleScreenshot = async (
    title: string,
    recordId: string,
    isAddOnRecent: boolean,
  ) => {
    var block = imageString.split(';')
    var contentType = block[0].split(':')[1]

    var realData = block[1].split(',')[1]

    var blob = b64toBlob(realData, contentType)

    var fd = new FormData()
    fd.append('isPosition', 'false')
    fd.append('screenshot', blob)
    fd.append('positionX', '')
    fd.append('positionY', '')
    fd.append('recordName', title)
    fd.append('recordId', recordId)

    const requestOptions = {
      method: 'POST',
      body: fd,
    }

    let pathname = isAddOnRecent
      ? 'handle-existing-record/'
      : 'handle-new-record/'
    const response = await fetch(
      `http://localhost:2000/${pathname}`,
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
    //       { type: 'getPageTitle' },
    //       function (response) {
    //         console.log('responce', response)
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
    chrome.runtime.sendMessage({ name: 'Start Recording' }, (res) => {})
  }

  const stopClicks = (isStop: boolean) => {
    setClickStart(isStop)
    chrome.runtime.sendMessage({ name: 'Stop Clicks' }, (response) => {
      window.open(`http://localhost:3000/item/${response.recordId}`)
      console.log('Responce from stop click with recordId', response)
    })
  }

  const fetchRecords = async () => {
    setShowRecords(true)
    let res = await fetch('http://localhost:2000/get-records')
    let data = await res.json()

    let base64Flag = 'data:image/jpeg;base64,'
    console.log("it's data", data, typeof data)

    let setData = data.data.map((ele: any) => {
      let imageStr = arrayBufferToBase64(ele.lastRecord.itemData.data.data)
      return {
        imgSrc: base64Flag + imageStr,
        recordId: ele.recordId,
        recordName: ele.recordName,
        time: ele.time,
      }
    })
    setRecords(setData)
    setIsRecordLoading(true)
  }

  function arrayBufferToBase64(buffer: any) {
    var binary = ''
    var bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    return window.btoa(binary)
  }
  const addOnRecent = (recordId: string) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function (tabs: any) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'getPageTitle' },
          function (response) {
            console.log('responce of regbnhgf', response)
            handleScreenshot(response.title, recordId, true)
            window.open(`http://localhost:3000/item/${recordId}`)
          },
        )
      },
    )
  }

  const createNewRecord = () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function (tabs: any) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'getPageTitle' },
          function (response) {
            console.log('responce of title', response)
            let recordId = `nmcHJs${Date.now()}`
            handleScreenshot(response.title, recordId, false)
            window.open(`http://localhost:3000/item/${recordId}`)
          },
        )
      },
    )
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
        <div>
          <img
            src={imageString}
            alt="sreenshot"
            style={{ width: '600px', height: '300px' }}
          />
          <div>
            <button onClick={() => createNewRecord()}>Create New</button>
            <button onClick={() => fetchRecords()}>Add Recent</button>
          </div>
          {showRecords && (
            <div className="recordContainer">
              {isRecordLoading ? (
                <div>
                  {records.map((ele, index) => {
                    return (
                      <div
                        style={{
                          display: 'flex',
                          cursor: 'pointer',
                          margin: '8px',
                        }}
                        onClick={() => addOnRecent(ele.recordId)}
                      >
                        <img
                          width={100}
                          height={60}
                          src={ele.imgSrc}
                          alt="image"
                        />
                        <h3 className="recordname">{ele.recordName}</h3>
                      </div>
                    )
                  })}
                </div>
              ) : (
                'Loading...'
              )}
            </div>
          )}
        </div>
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
