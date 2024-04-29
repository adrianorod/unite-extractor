(function () {
  // CONFIGURATIONS
  const IDs = {
    playerTarget: '.sc-7bda52f2-1.jrvggu',
    historyContainer: '.sc-17dce764-1.dKRkDg > div > div',
    matchClassName: '',
    dateAndResultContainer: '.sc-20c903f9-3.bdnait',
  };

  const state = {
    filters: [],
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message === undefined) return;

    const { action, value } = message;

    if (action === 'EXECUTE') {
      execute();

      return;
    }

    if (action === 'FILTER_UPDATE') {
      state.filters = value;

      return;
    }
  });

  // ACTIONS
  function execute() {
    const target = document.querySelector(IDs.playerTarget)
    const historyContainer = document.querySelector(IDs.historyContainer);
    const matches = getValidMatches(historyContainer);

    expandAllMatches(matches);
    const matchData = getMatchData(matches);
    dataToHTML(matchData);
  };

  function getValidMatches(container) {
    const { childNodes: matches } = container;

    return (
      Array
        .from(matches)
        .filter((match) => match.className === IDs.matchClassName)
        .map((match) => match.querySelector('div'))
    );
  }

  function expandAllMatches(matches) {
    matches.forEach((match) => {
      match.click();
    });
  }

  function getMatchData(matches) {
    return matches
      .map((match) => {
        const dateAndResult = match.querySelectorAll(IDs.dateAndResultContainer);
        const filterValue = (dateAndResult[0].childNodes[2] || dateAndResult[0].childNodes[1]).textContent.split(' ')[0].toLowerCase();

        if (!state.filters.includes(filterValue)) return undefined;

        const result = dateAndResult[0].childNodes[0].textContent;
        const date = dateAndResult[1].childNodes[0].textContent;
        const dataContainer = match.nextSibling;

        return {
          date,
          result,
        };
      })
      .filter((match) => match !== undefined);
  }

  function dataToHTML(data) {
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Unite Extractor</title>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="12">Team Data</td>
              <td colspan="10">Opponents Data</td>
            </tr>
            <tr>
              <td>Date</td>
              <td>Result</td>
              <td>Player</td>
              <td>Pokemon</td>
              <td>Points</td>
              <td>Kills</td>
              <td>Assists</td>
              <td>Damage Given</td>
              <td>Damage Received</td>
              <td>Heal</td>
              <td>Draft priority</td>
              <td>Bans</td>
              <td>Bans</td>
              <td>Draft priority</td>
              <td>Heal</td>
              <td>Damage Received</td>
              <td>Damage Given</td>
              <td>Assists</td>
              <td>Kills</td>
              <td>Points</td>
              <td>Pokemon</td>
              <td>Player</td>
            </tr>
            ${data.map((item) => (
              `<tr>
                <td>${item.date}</td>
                <td>${item.result}</td>
                <td>${item.player}</td>
                <td>${item.pokemon}</td>
                <td>${item.points}</td>
                <td>${item.kills}</td>
                <td>${item.assists}</td>
                <td>${item.dmgGiven}</td>
                <td>${item.dmgReceived}</td>
                <td>${item.heal}</td>
                <td>${item.draftPriority}</td>
                <td>${item.bans}</td>
                <td>${item.opponnetBans}</td>
                <td>${item.opponentDraftPriority}</td>
                <td>${item.opponentHeal}</td>
                <td>${item.opponentDmgReceived}</td>
                <td>${item.opponentDmgGiven}</td>
                <td>${item.opponentAssists}</td>
                <td>${item.opponentKills}</td>
                <td>${item.opponentPoints}</td>
                <td>${item.opponentPokemon}</td>
                <td>${item.opponentPlayer}</td>
              </tr>`
            ))}
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
  };
})();
