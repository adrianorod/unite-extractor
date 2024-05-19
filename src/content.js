(function () {
  // CONFIGURATIONS
  const IDs = {
    playerTarget: '.sc-7bda52f2-1.jrvggu',
    historyContainer: '.sc-17dce764-1.dKRkDg > div > div',
    matchClassName: '',
    dateAndResultContainer: '.sc-20c903f9-3.bdnait',
    pokemon: 'img[alt="Played pokemon"]',
    playersContainer: '.sc-a6584c64-0.dyvhyv',
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

    console.log(matchData);

    dataToHTML(matchData);
  }

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
      // if (match.nextSibling !== null || match.nextSibling.id !== '') return;
      match.click();
    });
  }

  function getMatchData(matches) {
    const matchData = [];

    matches
      .forEach((match) => {
        if (!match) return;

        const dateAndResult = match.querySelectorAll(IDs.dateAndResultContainer);
        const filterValue = (dateAndResult[0].childNodes[2] || dateAndResult[0].childNodes[1]).textContent.split(' ')[0].toLowerCase();

        if (state.filters.length > 0 && !state.filters.includes(filterValue)) return;

        const result = dateAndResult[0].childNodes[0].textContent;
        const date = dateAndResult[1].childNodes[0].textContent;
        const { team, opponentTeam } = getAllPlayersData(match.nextSibling);

        team.forEach((player, index) => {
          const finalData = {};

          finalData.result = result;
          finalData.date = date;
          finalData.pokemon = player.pokemon;
          finalData.opponentPokemon = opponentTeam[index].pokemon;

          matchData.push(finalData);
        });
      });

    return matchData;
  }

  function getAllPlayersData(container) {
    if (!container) return;

    const players = Array.from(container.querySelectorAll('table > tr'))
        .filter((item, index) => index !== 0 || index !== 6);
    const firstTeam = []
    const secondTeam = []

    players.forEach((item, index) => {
      const player = getPlayerData(item);

      if (index <= 4) {
        firstTeam.push(player);
      } else {
        secondTeam.push(player);
      }
    });

    return { team: firstTeam, opponentTeam: secondTeam };
  }

  function getPlayerData(container) {
    const player = {};

    player.pokemon = getPokemon(container);
  }

  function getPokemon(container) {
    const item = container.querySelector(IDs.pokemon).src.split('.png')[0].split('_');

    return item[item.length - 1];
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
  }
})();
