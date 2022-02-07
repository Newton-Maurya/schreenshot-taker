window.addEventListener('click', () => {

    let getClick = localStorage.getItem("isClicked")

    console.log("Hello Newton!", "getClicked", getClick)
    if (getClick === "true") {
      alert("Clicked on and it's true")
    }
    else if(getClick === "false") {
        alert("Stop click on and getClick is false")
    }
    chrome.runtime.sendMessage(
      'Take screenshot',
      (responce) => {
        console.log("responce", responce)
      },
    )
  })
