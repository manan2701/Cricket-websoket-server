function oversToBalls(overs) {
  if (!overs) return 0;
  const [o, b] = overs.toString().split(".");
  return Number(o) * 6 + Number(b || 0);
}

function liveMatchByIdSummary(fixture) {
  if (!fixture) return null;

  const {
    id,
    league_id,
    season_id,
    stage_id,
    round,
    note,

    league,
    localteam,
    visitorteam,
    venue,

    toss_won_team_id,
    elected,

    runs = [],

    referee,
    firstumpire,
    secondumpire,
    tvumpire
  } = fixture;

  /* -------- TEAM RUNS (LATEST INNINGS) -------- */
  const getTeamRuns = teamId =>
    runs
      .filter(r => r.team_id === teamId)
      .sort((a, b) => b.inning - a.inning)[0] || null;

  const localRuns = getTeamRuns(localteam.id);
  const visitorRuns = getTeamRuns(visitorteam.id);

  /* -------- DETERMINE BATTING TEAM -------- */
  let battingTeamId = null;
  if (runs.length === 0) {
    // No innings yet, first team to bat will be decided later
    battingTeamId = null;
  } else if (runs.length === 1) {
    // Only one team has batted
    battingTeamId = runs[0].team_id;
  } else if (runs.length >= 2) {
    // Second innings in progress
    battingTeamId = runs[runs.length - 1].team_id;
  }

  const localIsBatting = battingTeamId === localteam.id;
  const visitorIsBatting = battingTeamId === visitorteam.id;

  /* -------- TOSS MESSAGE -------- */
  let toss_message = null;
  if (toss_won_team_id && elected) {
    const tossWinner =
      toss_won_team_id === localteam.id
        ? localteam.name
        : visitorteam.name;
    const decision = elected === "bowling" ? "bowl" : "bat";
    toss_message = `${tossWinner} won the toss and elected to ${decision}`;
  }

  /* -------- MATCH MESSAGE -------- */
  let match_message = note || "Toss Time";

  // Limited overs match chase logic
  if (
    (fixture.type === "T20" || fixture.type === "ODI") &&
    localRuns &&
    visitorRuns
  ) {
    const firstInnings = runs.find(r => r.inning === 1);
    const secondInnings = runs.find(r => r.inning === 2);

    if (secondInnings) {
      const target = firstInnings.score + 1;
      const runsReq = Math.max(target - secondInnings.score, 0);
      const totalBalls = fixture.type === "T20" ? 120 : 300;
      const ballsLeft = Math.max(totalBalls - oversToBalls(secondInnings.overs), 0);
      match_message = `${(battingTeamId === localteam.id ? localteam.name : visitorteam.name)} need ${runsReq} runs in ${ballsLeft} balls`;
    } else if (!secondInnings && !localIsBatting) {
      match_message = "Yet to bat";
    }
  } else if (!localRuns && !visitorRuns) {
    match_message = "Yet to bat";
  }

  /* -------- FINAL RESPONSE -------- */
  return {
    id,
    league_id,
    season_id,
    stage_id,
    round,
    note,

    info: {
      toss_message,

      tournament: {
        id: league?.id ?? null,
        name: league?.name ?? null,
        code: league?.code ?? null,
        logo: league?.image_path ?? null
      },

      teams: {
        local: {
          id: localteam.id,
          name: localteam.name,
          code: localteam.code,
          logo: localteam.image_path,
          runs: localRuns?.score ?? 0,
          wickets: localRuns?.wickets ?? 0,
          overs: localRuns?.overs ?? 0,
          yet_to_bat: !localRuns || (localRuns.score === 0 && localRuns.overs === 0),
          isBatting: localIsBatting
        },

        visitor: {
          id: visitorteam.id,
          name: visitorteam.name,
          code: visitorteam.code,
          logo: visitorteam.image_path,
          runs: visitorRuns?.score ?? 0,
          wickets: visitorRuns?.wickets ?? 0,
          overs: visitorRuns?.overs ?? 0,
          yet_to_bat: !visitorRuns || (visitorRuns.score === 0 && visitorRuns.overs === 0),
          isBatting: visitorIsBatting
        }
      },

      venue: venue
        ? {
            id: venue.id,
            name: venue.name,
            city: venue.city,
            capacity: venue.capacity
          }
        : null,

      officials: {
        referee: referee?.fullname ?? null,
        first_umpire: firstumpire?.fullname ?? null,
        second_umpire: secondumpire?.fullname ?? null,
        tv_umpire: tvumpire?.fullname ?? null
      },

      match_message
    }
  };
}

module.exports = {
  liveMatchByIdSummary
};
