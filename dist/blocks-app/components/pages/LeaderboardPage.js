import { Devvit, useAsync } from '@devvit/public-api';
import { LeaderboardRow } from '.././LeaderboardRow.js';
import { PixelText } from '.././PixelText.js';
import { StyledButton } from '.././StyledButton.js';
import { Service } from '../../../service/Service.js';
import Settings from '../../../settings.json';
const Layout = (props) => (Devvit.createElement("vstack", { width: "100%", height: "100%" },
    Devvit.createElement("spacer", { height: "24px" }),
    Devvit.createElement("hstack", { width: "100%", alignment: "middle" },
        Devvit.createElement("spacer", { width: "24px" }),
        Devvit.createElement(PixelText, { scale: 2.5, color: Settings.theme.primary }, "Leaderboard"),
        Devvit.createElement("spacer", { grow: true }),
        Devvit.createElement(StyledButton, { appearance: "primary", label: "x", width: "32px", height: "32px", onPress: props.onClose }),
        Devvit.createElement("spacer", { width: "20px" })),
    Devvit.createElement("spacer", { height: "24px" }),
    Devvit.createElement("hstack", { grow: true },
        Devvit.createElement("spacer", { width: "24px" }),
        Devvit.createElement("zstack", { alignment: "start top", grow: true },
            Devvit.createElement("vstack", { width: "100%", height: "100%" },
                Devvit.createElement("hstack", { grow: true },
                    Devvit.createElement("vstack", { grow: true, backgroundColor: "white" },
                        Devvit.createElement("spacer", { height: "4px" }),
                        props.children,
                        Devvit.createElement("spacer", { height: "4px" })),
                    Devvit.createElement("spacer", { width: "4px" })),
                Devvit.createElement("spacer", { height: "4px" }))),
        Devvit.createElement("spacer", { width: "20px" })),
    Devvit.createElement("spacer", { height: "20px" })));
const rowCount = 10;
const availableHeight = 418;
const dividerHeight = 10;
export const LeaderboardPage = (props, context) => {
    const service = new Service(context);
    const { data, loading } = useAsync(async () => {
        try {
            return {
                leaderboard: await service.getScores(10),
                user: await service.getUserScore(props.username),
            };
        }
        catch (error) {
            if (error) {
                console.error('Error loading leaderboard data', error);
            }
            return {
                leaderboard: [],
                user: { rank: -1, score: 0 },
            };
        }
    });
    // Return early view if data is loading
    if (loading || data === null) {
        return (Devvit.createElement(Layout, { onClose: props.onClose },
            Devvit.createElement("vstack", { grow: true, alignment: "center middle" },
                Devvit.createElement(PixelText, { color: Settings.theme.secondary }, "Loading ..."))));
    }
    const isUserInTheTop = data.user.rank < rowCount;
    const rowHeight = isUserInTheTop
        ? `${(availableHeight - dividerHeight) / rowCount}px`
        : `${availableHeight / rowCount}px`;
    const numberOfScoresToInclude = !loading && data?.user && isUserInTheTop ? 10 : 9;
    const leaderboardRows = data.leaderboard.map((row, index) => {
        if (index >= numberOfScoresToInclude) {
            return null;
        }
        return (Devvit.createElement(LeaderboardRow, { rank: index + 1, height: rowHeight, name: row.member, score: row.score, onPress: () => context.ui.navigateTo(`https://reddit.com/u/${row.member}`) }));
    });
    const footer = (Devvit.createElement(Devvit.Fragment, null,
        Devvit.createElement("vstack", null,
            Devvit.createElement("spacer", { height: "4px" }),
            Devvit.createElement("hstack", null,
                Devvit.createElement("spacer", { width: "12px" }),
                Devvit.createElement("hstack", { grow: true, height: "2px", backgroundColor: Settings.theme.shadow }),
                Devvit.createElement("spacer", { width: "12px" })),
            Devvit.createElement("spacer", { height: "4px" })),
        Devvit.createElement(LeaderboardRow, { rank: data.user.rank, height: rowHeight, name: props.username ?? 'Unknown', score: data.user.score, onPress: () => context.ui.navigateTo(`https://reddit.com/u/${props.username}`) })));
    return (Devvit.createElement(Layout, { onClose: props.onClose },
        leaderboardRows,
        !isUserInTheTop && footer));
};
//# sourceMappingURL=LeaderboardPage.js.map