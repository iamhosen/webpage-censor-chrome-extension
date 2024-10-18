import "../../style.css";

document.addEventListener("DOMContentLoaded", () => {
  const wordsTextArea = document.getElementById("words") as HTMLTextAreaElement;
  const saveButton = document.getElementById("save") as HTMLButtonElement;
  const status = document.getElementById("status") as HTMLDivElement;

  console.log(wordsTextArea, saveButton, status);

  console.log(chrome.storage);

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
