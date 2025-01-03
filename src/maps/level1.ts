import { Mission1 } from "@/lib/missions/Mission1";

const level1 = {
    layout: [
        "RRRRRRRRRRRRRRRRRRRRRRRRR",
        "RR000RRRRRRRRRRRRRRRRRRRR",
        "RR0S0RRRRRRRRRRRRRRRRRRRR",
        "RR000RRRRRRRRRRRRRRRRRRRR",
        "RR000RRRRRRRRRRRRRRRRRRRR",
        "RT000TTTTTTTTTTTTTTTTTTTT",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT000000000RR00000000000T",
        "RT000000000RR00000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT000000000TT00000000000T",
        "RT000000000TT00000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RT0000000000000000000000T",
        "RTTTTTTTTTTTTTTTTTTTTTTTT"
    ],
    tileSize: 2,
    wallHeight: 7,
    mission: Mission1,
    mission_hud: [
        "Find the secret blue gem",
        "Kill all soldiers in the warehouse"
    ],
    mobs: [
        {
            type: 'Human',
        },
    ]
};

export default level1;