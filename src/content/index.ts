

window.addEventListener('load', () => {
  chrome.storage.sync.set({title: document.title}, () => {})
})
const screenshotTaker = (event: any) => {

  chrome.storage.sync.get('isClicked', (data) =>{
    let condition = data ? data.isClicked: false
    if(condition) {
      chrome.runtime.sendMessage({name: "Record Click", Xcoordinate: event.clientX, Ycoordinate: event.clientY, title: document.title})
      }
    })
  }

window.addEventListener('mouseup', (event) => {
  screenshotTaker(event)
})

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {

  chrome.runtime.sendMessage({name: "screenshot"}, (res) => {
  })
  sendResponse({title: document.title, })
});

