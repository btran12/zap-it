(function () {
  if (!window.__zapperInitialized) {
    window.__zapperInitialized = true;
    window.__zapperActive = false;
    window.__zapperTrash = [];

    let previous;
    let badge;

    // Inject CSS for highlight + badge
    const style = document.createElement('style');
    style.textContent = `
      .__zapper-highlight {
        outline: 2px solid red !important;
        cursor: crosshair !important;
      }
      .__zapper-badge {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(255, 0, 0, 0.9);
        color: white;
        font-family: sans-serif;
        font-size: 13px;
        line-height: 1.3;
        padding: 10px 14px;
        border-radius: 8px;
        z-index: 999999999 !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        pointer-events: none;
        max-width: 250px;
        white-space: pre-wrap;
      }
    `;
    document.documentElement.appendChild(style);

    function showBadge() {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = "__zapper-badge";
        badge.innerText = 
          "🗑 Zapper Mode ON\n\n" +
          "• Hover highlights elements\n" +
          "• Left-click removes\n" +
          "• Press 'U' to undo\n" +
          "• Press 'Esc' to exit";
        document.body.appendChild(badge);
      }
    }

    function hideBadge() {
      if (badge) {
        badge.remove();
        badge = null;
      }
    }

    function highlight(e) {
      if (!window.__zapperActive) return;
      if (previous && previous !== e.target) {
        previous.classList.remove("__zapper-highlight");
      }
      e.target.classList.add("__zapper-highlight");
      previous = e.target;
    }

    function removeHighlighted(e) {
      if (!window.__zapperActive) return;
      if (e.button === 0 && previous) { // Left-click
        e.preventDefault();
        e.stopPropagation();
        window.__zapperTrash.push({
          element: previous,
          parent: previous.parentNode,
          nextSibling: previous.nextSibling
        });
        previous.remove();
        previous = null;
      }
    }

    function undoLast() {
      const last = window.__zapperTrash.pop();
      if (last) {
        if (last.nextSibling) {
          last.parent.insertBefore(last.element, last.nextSibling);
        } else {
          last.parent.appendChild(last.element);
        }
      }
    }

    function cleanupHighlight() {
      if (previous) {
        previous.classList.remove("__zapper-highlight");
        previous = null;
      }
    }

    function keyHandler(e) {
	  if (!window.__zapperActive) return;
	  if (e.key.toLowerCase() === 'u') {
		undoLast();
	  } else if (e.key === 'Escape') {
		window.__zapperActive = false;
		cleanupHighlight();
		hideBadge();
		console.log("Zapper deactivated.");

		// Notify background script to update badge and state
		chrome.runtime.sendMessage({ type: "DEACTIVATE_ZAPPER" });
	  }
	}


    // Event listeners
    document.addEventListener('mouseover', highlight, true);
    document.addEventListener('mousedown', removeHighlighted, true);
    document.addEventListener('keydown', keyHandler, true);

    // Toggle from background.js
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data.type === "__TOGGLE_ZAPPER__") {
        window.__zapperActive = event.data.enabled;
        if (event.data.enabled) {
          showBadge();
        } else {
          hideBadge();
          cleanupHighlight();
        }
        console.log(`Zapper ${event.data.enabled ? "activated" : "deactivated"}`);
      }
    });

    console.log("Zapper script loaded: Click extension icon to toggle.");
  }
})();
