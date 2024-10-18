// src/extension/content/content.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message from popup:", request);

  if (request.greeting === "Hello from Popup") {
    alert(request.greeting);
    sendResponse({ farewell: "Goodbye from Content Script!" });
  }
});

type Maybe<T> = T | null;

// content.js

let censoredWords = ["badword1", "badword2", "badword3"];
const replacement = "****";

// Function to censor text nodes
function censorText(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text: Maybe<string> = node.nodeValue;
    censoredWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      text = text?.replace(regex, replacement) as Maybe<string>;
    });
    node.nodeValue = text;
  } else {
    if (
      node.nodeName !== "SCRIPT" &&
      node.nodeName !== "STYLE" &&
      node.nodeName !== "NOSCRIPT"
    ) {
      node.childNodes.forEach((child) => censorText(child));
    }
  }
}

// Initial censorship
censorText(document.body);

// Set up MutationObserver for dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      censorText(node);
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Load censored words from storage
chrome.storage.sync.get(["censoredWords"], (result) => {
  if (result.censoredWords) {
    censoredWords = result.censoredWords;
    // Re-censor the page with updated words
    censorText(document.body);
  }
});

// Listen for updates from options page
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === "updateWords") {
    censoredWords = request.words;
    // Re-censor the page with updated words
    censorText(document.body);
    sendResponse({ status: "Words updated" });
  }
});
