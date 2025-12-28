function summariseUpcomingFixtures(fixtures) {
    // console.log(fixtures)
  return fixtures.map(match => ({
    match_id: match.id,
    round: match.round,
    league_name: match.league?.name ?? null,
    type: match.type,

    team_1: match.localteam?.name ?? null,
    team_2: match.visitorteam?.name ?? null,

    venue_name: match.venue?.name ?? null,
    starting_at: match.starting_at // AS-IS
  }));
}

module.exports = { summariseUpcomingFixtures }