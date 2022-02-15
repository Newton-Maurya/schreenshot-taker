


window.addEventListener('load', () => {  
  chrome.storage.sync.set({ isClicked: false }, () => {})
  chrome.storage.sync.set({lastImage: ""}, () => {})
})

let count = 0;
const screenshotTaker = (event: any) => {
  console.log("Inside screenTaker, event.clientX, event.clientY", event.clientX, event.clientY)
  chrome.storage.sync.get('isClicked', (data) =>{
    let condition = data ? data.isClicked: false
    if(condition) {
      count++
      chrome.runtime.sendMessage({name: "Record Click", count: count, Xcoordinate: event.clientX, Ycoordinate: event.clientY})
      }
    })
  }

window.addEventListener('click', (event) => {
  screenshotTaker(event)
})

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {

  chrome.runtime.sendMessage({name: "screenshot"}, (res) => {


    // chrome.storage.sync.set({imageString: res}, () => {})
    // console.log("Screenshot taken", res, request)
    // Promise.resolve("").then(result => sendResponse(result));
    // return true;
  })
  sendResponse("responce sent")
});

// let vr = 

// console.log('vr', vr)
