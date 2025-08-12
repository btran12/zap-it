let zapperEnabled = false;

chrome.action.onClicked.addListener((tab) => {
  zapperEnabled = !zapperEnabled;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['zapper.js']
  }, () => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (enabled) => {
        window.postMessage({ type: "__TOGGLE_ZAPPER__", enabled });
      },
      args: [zapperEnabled]
    });
  });

  updateBadge(tab.id, zapperEnabled);
});

function updateBadge(tabId, enabled) {
  chrome.action.setBadgeText({ tabId, text: enabled ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "red" });
}

// Listen for deactivation message from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DEACTIVATE_ZAPPER") {
    zapperEnabled = false;
    if (sender.tab && sender.tab.id) {
      updateBadge(sender.tab.id, false);
    }
  }
});
