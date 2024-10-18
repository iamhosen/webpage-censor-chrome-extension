// src/extension/content/content.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "Hello from Popup") {
    alert(request.greeting);
    sendResponse({ farewell: "Goodbye from Content Script!" });
  }
});
