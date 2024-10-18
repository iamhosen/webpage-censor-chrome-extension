import "../../style.css";

document.getElementById("click-me")?.addEventListener("click", () => {
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   if (tabs[0].id) {
  //     chrome.tabs.sendMessage(tabs[0].id, { greeting: "Hello from Popup" });
  //   }
  // });

  chrome.runtime.openOptionsPage();
});
