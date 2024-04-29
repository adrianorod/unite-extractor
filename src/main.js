(function () {
  // CONFIGURATIONS
  const elements = {
    buttonExtract: '#button-extract',
    errorContent: '#error-content',
    filterItems: '#filter-container > input'
  };

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const currentTab = await getCurrentTab();
      const buttonExtract = document.querySelector(elements.buttonExtract);

      buttonExtract.addEventListener('click', extract);
      chrome.scripting.executeScript({ target: { tabId: currentTab.id }, files: ['./src/extract.js'] });
    } catch (e) {
      showError(e);
    }
  });

  // ACTIONS
  function showError(error) {
    const errorContent = document.querySelector(elements.errorContent);
    const errorItem = document.createElement('div');

    errorItem.innerText = error.message;
    errorContent.appendChild(errorItem);
  }

  function getFilters() {
    const filterElements = document.querySelectorAll(elements.filterItems);

    return Array.from(filterElements).filter((item) => item.checked).map((item) => item.value);
  }

  async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);

    return tab;
  }

  async function extract() {
    try {
      const currentTab = await getCurrentTab();

      chrome.tabs.sendMessage(currentTab.id, { action: 'FILTER_UPDATE', value: getFilters() });
      chrome.tabs.sendMessage(currentTab.id, { action: 'EXECUTE' });
    } catch (e) {
      showError(e);
    }
  }
})();
