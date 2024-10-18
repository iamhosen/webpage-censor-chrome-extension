import "../../style.css";

type TCensorType = "word" | "webpage";

document.addEventListener("DOMContentLoaded", () => {
  const wordsTextArea = document.getElementById("words") as HTMLTextAreaElement;
  const saveButton = document.getElementById("save") as HTMLButtonElement;
  const status = document.getElementById("status") as HTMLDivElement;
  const censorType = document.querySelectorAll(
    'input[name="censor-type"]'
  ) as NodeListOf<HTMLInputElement>;

  chrome.storage?.sync.get(["censoredWords", "censoredType"], (result) => {
    if (result.censoredWords) {
      wordsTextArea.value = result.censoredWords.join(", ");
    }

    const censoredType = result.censoredType || ("webpage" as TCensorType);

    const selectedCensorTypeInput = document.querySelector(
      `input[name="censor-type"][value="${censoredType}"]`
    ) as HTMLInputElement;

    selectedCensorTypeInput.checked = true;
  });

  saveButton.addEventListener("click", () => {
    const words = wordsTextArea.value
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word);

    const censorTypeInput = document.querySelector(
      'input[name="censor-type"]:checked'
    ) as HTMLInputElement;
    const censorTypeValue = censorTypeInput.value as TCensorType;

    chrome.storage.sync.set(
      { censoredWords: words, censoredType: censorTypeValue },
      () => {
        status.textContent = "Options saved.";

        setTimeout(() => {
          status.textContent = "";
        }, 2000);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id as number, {
            action: "updateWords",
            words: words,
            type: censorTypeValue,
          });
        });
      }
    );
  });
});
