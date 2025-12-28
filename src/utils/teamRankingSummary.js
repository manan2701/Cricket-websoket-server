function teamRankingSummary(rankings) {
    return rankings.map(rankingBlock => {
        const {
            type,
            updated_at,
            gender,
            team = []
        } = rankingBlock;

        return {
            type,
            updated_at,
            gender,
            teams: team.map(t => ({
                team: t.name,
                team_code: t.code,
                logo: t.image_path,
                rank: t.position ?? 0,
                rating: t.ranking?.rating ?? 0,
                points: t.ranking?.points ?? 0,
                matches: t.ranking?.matches ?? 0
            }))
        };
    });
}

module.exports = { teamRankingSummary };