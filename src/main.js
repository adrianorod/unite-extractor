(function () {
  // CONFIGURATIONS
  const elements = {
    buttonExtract: '#button-extract',
    errorContent: '#error-content',
    content: '#content',
  };

  init();

  // ACTIONS
  function init() {
    try {
      const buttonExtract = document.querySelector(elements.buttonExtract);

      buttonExtract.addEventListener('click', extract);
    } catch (e) {
      showError(e);
    }
  }

  function showError(error) {
    const errorContent = document.querySelector(elements.errorContent);
    const errorItem = document.createElement('div');

    errorItem.innerText = error.message;
    errorContent.appendChild(errorItem);
  }

  async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);

    return tab;
  }

  async function extract() {
    try {
      const currentTab = await getCurrentTab();

      chrome.scripting.executeScript({ target: { tabId: currentTab.id }, files: ['./src/extract.js'] });
    } catch (e) {
      showError(e);
    }
  }
})();
