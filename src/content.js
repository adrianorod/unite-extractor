(function () {
  // CONFIGURATIONS
  const IDs = {
    playerTarget: '.sc-7bda52f2-1.jrvggu',
    historyContainer: '.sc-17dce764-1.dKRkDg > div > div',
    matchClassName: '',
    dateAndResultContainer: '.sc-20c903f9-3.bdnait',
    pokemon: 'img[alt="Played pokemon"]',
    playersContainer: '.sc-a6584c64-0.dyvhyv',
    playerRow: 'table > tbody > tr',
    playerName: '.sc-7bda52f2-3.bjWUWj',
    points: '.sc-7bda52f2-3.bjWUWj',
    killsAssists: '.sc-7bda52f2-3.bjWUWj',
    dmgGiven: '.sc-7bda52f2-3.bjWUWj',
    dmgGivenRate: '.sc-71f8e1a4-0.iDyfuw',
    dmgReceived: '.sc-7bda52f2-3.bjWUWj',
    dmgReceivedRate: '.sc-71f8e1a4-0.iDyfuw',
    heal: '.sc-7bda52f2-3.bjWUWj',
    healRate: '.sc-71f8e1a4-0.iDyfuw',
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
  async function execute() {
    const target = document.querySelector(IDs.playerTarget)
    const historyContainer = document.querySelector(IDs.historyContainer);
    const matches = getValidMatches(historyContainer);

    const expandedMatches = await expandAllMatches(matches);
    const matchData = getMatchData(expandedMatches);

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
    return new Promise((res) => {
      matches.forEach((match) => {
        if (match.nextSibling !== null && match.nextSibling.id === '') return;
        match.click();
      });

      setTimeout(() => {
        const historyContainer = document.querySelector(IDs.historyContainer);
        res(getValidMatches(historyContainer));
      }, 5000);
    })
  }

  function getMatchData(matches) {
    if (!matches?.length) {
      throw new Error(`getMatchData: matches is ${matches}`);
    }

    const matchData = [];

    matches
      .forEach((match) => {
        if (!match) {
          throw new Error(`getMatchData: single match is ${match}`);
        }

        const dateAndResult = match.querySelectorAll(IDs.dateAndResultContainer);
        const filterValue = (dateAndResult[0].childNodes[2] || dateAndResult[0].childNodes[1])?.textContent.split(' ')[0].toLowerCase();

        if (filterValue && state.filters.length > 0 && !state.filters.includes(filterValue)) return;

        const result = dateAndResult[0].childNodes[0].textContent;
        const date = dateAndResult[1].childNodes[0].textContent;
        const { team, opponentTeam } = getAllPlayersData(match.nextSibling);

        team.forEach((player, index) => {
          const finalData = {};

          finalData.result = result;
          finalData.date = date.split(' ')[0].replaceAll('-', '/');

          finalData.player = team[index];
          finalData.opponentPlayer = opponentTeam[index];

          matchData.push(finalData);
        });
      });

    return matchData;
  }

  function getAllPlayersData(container) {
    if (!container) {
      throw new Error(`getAllPlayersData: container is ${container}`);
    }

    const players = Array.from(container.querySelectorAll(IDs.playerRow))
        .filter((item, index) => index !== 0 && index !== 6);

    if (players.length !== 10) {
      throw new Error(`getAppPlayersData: error obtaining players rows`);
    }

    const firstTeam = [];
    const secondTeam = [];

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
    player.player = getPlayerName(container);
    player.points = getPoints(container);
    player.kills = getKills(container);
    player.assists = getAssists(container);
    player.dmgGiven = getDmgGiven(container);
    player.dmgGivenRate = getDmgGivenRate(container);
    player.dmgReceived = getDmgReceived(container);
    player.dmgReceivedRate = getDmgReceivedRate(container);
    player.heal = getHeal(container);
    player.healRate = getHealRate(container);

    return player;
  }

  function getPokemon(container) {
    try {
      const item = container.querySelector(IDs.pokemon).src.split('.png')[0].split('_');
      return item[item.length - 1];
    } catch {
      console.warn('getPokemon: error obtaining pokemon name');
      return 'undefined';
    }
  }

  function getPlayerName(container) {
    try {
      const item = container.querySelector(IDs.playerName);
      return item.innerText;
    } catch {
      console.warn('getPlayerName: error obtaining player name');
      return 'undefined';
    }
  }

  function getPoints(container) {
    try {
      const item = container.querySelectorAll(IDs.points)[1];
      return item.innerText;
    } catch {
      console.warn('getPoints: error obtaining player points');
      return 'undefined';
    }
  }

  function getKills(container) {
    try {
      const item = container.querySelectorAll(IDs.killsAssists)[2];
      return item.innerText.split(' | ')[0];
    } catch {
      console.warn('getKills: error obtaining player kills');
      return 'undefined';
    }
  }

  function getAssists(container) {
    try {
      const item = container.querySelectorAll(IDs.killsAssists)[2];
      return item.innerText.split(' | ')[1];
    } catch {
      console.warn('getAssists: error obtaining player assists');
      return 'undefined';
    }
  }

  function getDmgGiven(container) {
    try {
      const item = container.querySelectorAll(IDs.dmgGiven)[3];
      return item.innerText;
    } catch {
      console.warn('getDmgGiven: error obtaining player damage given');
      return 'undefined';
    }
  }

  function getDmgGivenRate(container) {
    try {
      const item = container.querySelectorAll(IDs.dmgGivenRate)[0];
      return item.innerText.replace(' ', '');
    } catch {
      console.warn('getDmgGivenRate: error obtaining player damage given rate');
      return 'undefined';
    }
  }

  function getDmgReceived(container) {
    try {
      const item = container.querySelectorAll(IDs.dmgReceived)[4];
      return item.innerText;
    } catch {
      console.warn('getDmgReceived: error obtaining player damage received');
      return 'undefined';
    }
  }

  function getDmgReceivedRate(container) {
    try {
      const item = container.querySelectorAll(IDs.dmgReceivedRate)[1];
      return item.innerText.replace(' ', '');
    } catch {
      console.warn('getDmgReceivedRate: error obtaining player damage received rate');
      return 'undefined';
    }
  }

  function getHeal(container) {
    try {
      const item = container.querySelectorAll(IDs.heal)[4];
      return item.innerText;
    } catch {
      console.warn('getHeal: error obtaining player heal');
      return 'undefined';
    }
  }

  function getHealRate(container) {
    try {
      const item = container.querySelectorAll(IDs.healRate)[1];
      return item.innerText.replace(' ', '');
    } catch {
      console.warn('getHealRate: error obtaining player heal rate');
      return 'undefined';
    }
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
              <td colspan="15">Team Data</td>
              <td colspan="13">Opponents Data</td>
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
              <td>Damage Given Rate</td>
              <td>Damage Received</td>
              <td>Damage Received Rate</td>
              <td>Heal</td>
              <td>Heal Rate</td>
              <td>Draft priority</td>
              <td>Bans</td>
              <td>Bans</td>
              <td>Draft priority</td>
              <td>Heal Rate</td>
              <td>Heal</td>
              <td>Damage Received Rate</td>
              <td>Damage Received</td>
              <td>Damage Given Rate</td>
              <td>Damage Given</td>
              <td>Assists</td>
              <td>Kills</td>
              <td>Points</td>
              <td>Pokemon</td>
              <td>Player</td>
            </tr>
            ${data.map(({ date, result, player, opponentPlayer }) => (
              `<tr>
                <td>${date}</td>
                <td>${result}</td>
                <td>${player.player}</td>
                <td>${player.pokemon}</td>
                <td>${player.points}</td>
                <td>${player.kills}</td>
                <td>${player.assists}</td>
                <td>${player.dmgGiven}</td>
                <td>${player.dmgGivenRate}</td>
                <td>${player.dmgReceived}</td>
                <td>${player.dmgReceivedRate}</td>
                <td>${player.heal}</td>
                <td>${player.healRate}</td>
                <td>${player.draftPriority}</td>
                <td>${player.bans}</td>
                <td>${opponentPlayer.bans}</td>
                <td>${opponentPlayer.draftPriority}</td>
                <td>${opponentPlayer.healRate}</td>
                <td>${opponentPlayer.heal}</td>
                <td>${opponentPlayer.dmgReceivedRate}</td>
                <td>${opponentPlayer.dmgReceived}</td>
                <td>${opponentPlayer.dmgGivenRate}</td>
                <td>${opponentPlayer.dmgGiven}</td>
                <td>${opponentPlayer.assists}</td>
                <td>${opponentPlayer.kills}</td>
                <td>${opponentPlayer.points}</td>
                <td>${opponentPlayer.pokemon}</td>
                <td>${opponentPlayer.player}</td>
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
