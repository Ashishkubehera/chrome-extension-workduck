// Send message to content script
function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
        console.log(response);
      });
    });
  }
  
  // Mouse click event
  chrome.action.onClicked.addListener((tab) => {
    sendMessageToContentScript({ type: "capture-info" });
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "capture-info") {
      // Capture information from webpage
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        function: () => {
          // Find element and capture its text
          const element = document.querySelector("element-selector");
          const text = element.innerText;
  
          // Save captured information to local storage
          const id = Math.floor(Math.random() * 10000); // Generate random ID
          const url = window.location.href; // Get URL of webpage
          const timestamp = new Date().toLocaleString(); // Get current time
          const info = { id, text, url, timestamp };
          localStorage.setItem(id, JSON.stringify(info));
  
          // Alert user that information has been saved
          alert("Information has been saved!");
        },
      });
    }
  });
  