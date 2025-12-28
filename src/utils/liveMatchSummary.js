function oversToBalls(overs) {
  if (!overs) return 0;
  const [o, b] = overs.toString().split(".");
  return Number(o) * 6 + Number(b || 0);
}

function getLeadTrailMessage(battingTeam, diff) {
  return diff >= 0
    ? `${battingTeam} lead by ${diff} runs`
    : `${battingTeam} trail by ${Math.abs(diff)} runs`;
}

function buildLiveMatchesListSummary(fixtures) {
  if (!Array.isArray(fixtures)) return [];

  return fixtures.map((fixture) => {
    const {
      id,
      league_id,
      starting_at,
      type,
      round,
      status,
      live,
      note,
      localteam,
      visitorteam,
      runs = [],
      toss_won_team_id,
      elected,
      winner_team_id,
    } = fixture;

    /* -------- INNINGS DATA -------- */
    const teamRuns = (teamId) =>
      runs
        .filter((r) => r.team_id === teamId)
        .sort((a, b) => b.inning - a.inning)[0];

    const localInnings = teamRuns(localteam.id);
    const visitorInnings = teamRuns(visitorteam.id);

    const firstInnings = runs.find((r) => r.inning === 1);
    const secondInnings = runs.find((r) => r.inning === 2);

    /* -------- BATTING TEAM -------- */
    let battingTeamId = null;
    if (status === "1st Innings") {
      battingTeamId = localteam.id;
    } else if (status === "2nd Innings") {
      if (secondInnings) {
        battingTeamId = secondInnings.team_id;
      } else {
        // fallback
        battingTeamId = visitorteam.id;
      }
    }
    const battingTeam = battingTeamId === localteam.id ? localteam : visitorteam;
    const bowlingTeam = battingTeamId === localteam.id ? visitorteam : localteam;

    /* -------- MATCH MESSAGE -------- */
    let match_message = "Toss Time";

    /* -------- TOSS MESSAGE -------- */
    if (
      toss_won_team_id &&
      elected &&
      typeof status === "string" &&
      !["2nd Innings", "3rd Innings", "4th Innings"].some((s) =>
        status.includes(s)
      )
    ) {
      const tossWinner =
        toss_won_team_id === localteam.id ? localteam.code : visitorteam.code;

      match_message = `${tossWinner} won the toss and elected to ${
        elected === "bowling" ? "bowl" : "bat"
      }`;
    }

    /* -------- LIMITED OVERS CHASE (T20/ODI) -------- */
    else if (
      (type === "T20" || type === "ODI") &&
      status === "2nd Innings" &&
      firstInnings &&
      secondInnings
    ) {
      const target = firstInnings.score + 1;
      const runsReq = Math.max(target - secondInnings.score, 0);

      const totalBalls = type === "T20" ? 120 : 300;
      const ballsLeft = Math.max(totalBalls - oversToBalls(secondInnings.overs), 0);

      match_message = `${battingTeam.name} need ${runsReq} runs in ${ballsLeft} balls`;
    }

    /* -------- TEST LEAD / TRAIL -------- */
    else if (type === "TEST" && runs.length >= 2 && runs.length < 4) {
      const first = runs.find((r) => r.inning === 1);
      const second = runs.find((r) => r.inning === 2);

      if (first && second && battingTeam) {
        const diff = second.score - first.score;
        match_message = getLeadTrailMessage(battingTeam.name, diff);
      }
    }

    /* -------- TEST FINAL INNINGS CHASE -------- */
    else if (type === "TEST" && runs.length === 4) {
      const first = runs.find((r) => r.inning === 1);
      const second = runs.find((r) => r.inning === 2);
      const fourth = runs.find((r) => r.inning === 4);

      if (first && second && fourth) {
        const target = first.score + second.score + 1;
        const runsReq = target - fourth.score;
        const ballsLeft = 540 - oversToBalls(fourth.overs); // 90 overs
        const wicketsLeft = 10 - fourth.wickets;

        match_message = `${battingTeam.name} need ${runsReq} runs in ${ballsLeft} balls with ${wicketsLeft} wickets left`;
      }
    } else {
      match_message = note || status;
    }

    /* -------- MATCH WINNER -------- */
    const matchWinner =
      winner_team_id === null
        ? "In Progress"
        : winner_team_id === localteam.id
        ? localteam.name
        : visitorteam.name;

    /* -------- FINAL RESPONSE -------- */
    return {
      match_id: id,
      tournament_id: league_id,
      match_type: type,
      round,
      starting_at,
      live,
      status,
      note,
      match_message,
      match_winner: matchWinner,

      teams: [
        {
          id: localteam.id,
          name: localteam.name,
          code: localteam.code,
          logo: localteam.image_path,
          runs: localInnings?.score ?? 0,
          wickets: localInnings?.wickets ?? 0,
          overs: localInnings?.overs ?? 0,
          isBatting: battingTeamId === localteam.id,
          yet_to_bat:
            !localInnings || (localInnings.score === 0 && localInnings.overs === 0)
              ? true
              : false,
        },
        {
          id: visitorteam.id,
          name: visitorteam.name,
          code: visitorteam.code,
          logo: visitorteam.image_path,
          runs: visitorInnings?.score ?? 0,
          wickets: visitorInnings?.wickets ?? 0,
          overs: visitorInnings?.overs ?? 0,
          isBatting: battingTeamId === visitorteam.id,
          yet_to_bat:
            !visitorInnings || (visitorInnings.score === 0 && visitorInnings.overs === 0)
              ? true
              : false,
        },
      ],
    };
  });
}

module.exports = { buildLiveMatchesListSummary };
