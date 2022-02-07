import React, { useState, FC, useEffect } from 'react'

const style = {
  main: {
    width: '400px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    // marginLeft: '100px',
  },
  containerBtn: {
    padding: '9px 10px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '15px',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
}

const App: FC<any> = () => {
  const [isClickStart, setClickStart] = useState<boolean>(false)

  useEffect(() => {
    let isClick = isClickStart ? 'true' : 'false'
    localStorage.setItem('isClicked', isClick)
  }, [isClickStart])

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
      <div>Screenshots</div>
      <div style={style.buttonContainer}>
        <button style={style.containerBtn}>Take Screenshot</button>
        <button style={style.containerBtn} onClick={() => setClickStart(false)}>
          Stop Clicks
        </button>
        <button style={style.containerBtn} onClick={() => setClickStart(true)}>
          Record Clicks
        </button>
      </div>
    </div>
  )
}

export default App

