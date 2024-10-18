type Maybe<T> = T | null;

const censoredWords: string[] = [];

const replacement = "****";

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

const censorWebpage = (node: Node) => {
  let hasCensoredWords = false;

  const checkForCensoredWords = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      censoredWords.forEach((word) => {
        if (node.nodeValue?.includes(word)) {
          hasCensoredWords = true;
        }
      });
    } else {
      if (
        node.nodeName !== "SCRIPT" &&
        node.nodeName !== "STYLE" &&
        node.nodeName !== "NOSCRIPT"
      ) {
        node.childNodes.forEach((child) => checkForCensoredWords(child));
      }
    }
  };

  checkForCensoredWords(node);

  if (hasCensoredWords) {
    document.body.remove();

    setTimeout(() => {
      alert("You have been banned from this website.");
    }, 1000);
  }
};

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

chrome.storage.sync.get(["censoredWords", "censoredType"], (result) => {
  if (result.censoredWords) {
    censoredWords.push(...result.censoredWords);
  }

  if (result.censoredType === "webpage") {
    censorWebpage(document.body);
  } else if (result.censoredType === "word") {
    censorText(document.body);
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === "updateWords") {
    sendResponse({ status: "Words updated" });

    if (request.words?.length) {
      censoredWords.push(...request.words);
    }

    if (request.type === "webpage") {
      censorWebpage(document.body);
    } else if (request.type === "word") {
      censorText(document.body);
    }
  }
});
