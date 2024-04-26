(function () {
  // CONFIGURATIONS
  const IDs = {
    playerTarget: '.sc-7bda52f2-1.jrvggu',
    historyContainer: '.sc-17dce764-1.dKRkDg > div > div',
    matchClassName: '',
  };

  execute();

  // ACTIONS
  function execute() {
    const target = document.querySelector(IDs.playerTarget)
    const historyContainer = document.querySelector(IDs.historyContainer);
    const matches = getValidMatches(historyContainer);

    expandAllMatches(matches);

    console.log(matches);
  };

  function getValidMatches(container) {
    const { childNodes: matches } = container;

    return Array.from(matches).filter((match) => match.className === IDs.matchClassName);
  }

  function expandAllMatches(matches) {
    matches.forEach((match) => {
      match.click();
    });
  }

  function dataToHTML(data) {
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Unite Extractor</title>
        </head>
        <body>
          <table><tr><td>${data}</td></tr></table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
  };
})();
