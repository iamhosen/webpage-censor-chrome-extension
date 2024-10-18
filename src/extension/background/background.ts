// src/extension/background/background.ts
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "Hello from Popup") {
    console.log("Received greeting from popup.");
    sendResponse({ farewell: "Goodbye!" });
  }
});
