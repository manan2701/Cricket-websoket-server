function summariseUpcomingResults(fixtures) {
    return fixtures.map(fixture => {
        const {
            id,
            league_id,
            type,
            round,
            starting_at,
            status,
            note,
            winner_team_id,
            localteam,
            visitorteam,
            runs = [],
            venue,
            league
        } = fixture;

        const getRuns = (teamId) => {
            const run = runs.find(r => r.team_id === teamId);
            return {
                runs: run?.score ?? null,
                wickets: run?.wickets ?? null,
                overs: run?.overs ?? null
            };
        };

        const localScore = getRuns(localteam?.id);
        const visitorScore = getRuns(visitorteam?.id);

        return {
            match_id: id,
            tournament_id: league_id,
            match_type: type,
            round,
            starting_at,
            status,
            note,

            venuname: venue?.name ?? null,
            city: venue?.city ?? null,
            leaguename: league?.name ?? null,

            teams: [
                {
                    id: localteam?.id,
                    name: localteam?.name,
                    logo: localteam?.image_path,
                    runs: localScore.runs,
                    wickets: localScore.wickets,
                    overs: localScore.overs,
                    isWinner: winner_team_id === localteam?.id
                },
                {
                    id: visitorteam?.id,
                    name: visitorteam?.name,
                    logo: visitorteam?.image_path,
                    runs: visitorScore.runs,
                    wickets: visitorScore.wickets,
                    overs: visitorScore.overs,
                    isWinner: winner_team_id === visitorteam?.id
                }
            ]
        };
    });
}


module.exports = { summariseUpcomingResults }