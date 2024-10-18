import "./style.css";

type Maybe<T> = T | null;

// content.js

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

// OPTIONS

// options.js

document.addEventListener("DOMContentLoaded", () => {
  const wordsTextArea = document.getElementById("words") as HTMLTextAreaElement;
  const saveButton = document.getElementById("save") as HTMLButtonElement;
  const status = document.getElementById("status") as HTMLDivElement;

  // Load existing words from storage
  chrome.storage.sync.get(["censoredWords"], (result) => {
    if (result.censoredWords) {
      wordsTextArea.value = result.censoredWords.join(", ");
    }
  });

  // Save words to storage
  saveButton.addEventListener("click", () => {
    const words = wordsTextArea.value
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word);
    chrome.storage.sync.set({ censoredWords: words }, () => {
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 2000);
      // Notify content scripts to update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id as number, {
          action: "updateWords",
          words: words,
        });
      });
    });
  });
});
