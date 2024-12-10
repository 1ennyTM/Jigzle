import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
//import { LevelPage } from '../../components/pages/LevelPage.js';
import { EditorPage } from '../../components/pages/EditorPage.js';
//import { MyDrawingsPage } from '../../components/MyDrawingsPage.js';
import { HowToPlayPage } from '../../components/pages/HowToPlayPage.js';
import { LeaderboardPage } from '../../components/pages/LeaderboardPage.js';
import { LoadingState } from '../../components/LoadingState.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { PixelText } from '../../components/PixelText.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../../service/Service.js';
import { getLevelByScore } from '../../utils/progression.js';
import Settings from '../../../settings.json';
//import type { Dictionary } from '../../types/Dictionary.js';
import { GameSettings } from '../../../types/GameSettings.js';
import { UserData } from '../../../types/UserData.js';
export const PinnedPost = (props, context) => {
    const service = new Service(context);
    const [page, setPage] = useState('menu');
    const buttonWidth = '256px';
    const buttonHeight = '48px';
    const { data: user, loading } = useAsync(async () => {
        return await service.getUserScore(props.username);
    });
    if (user === null || loading) {
        return Devvit.createElement(LoadingState, null);
    }
    const level = getLevelByScore(user?.score ?? 0);
    /*
      each level has a "min" and "max" score value
      the score can be inside or outside this range.
      I want the percentage to be calculated based on the user's score relative to the level's min and max score values.
      the score does not reset per level, so the user's score can be higher than the max score of the current level.
      If out of bounds, clip to 0 or 100.
    */
    const percentage = Math.round(Math.min(100, Math.max(0, (((user?.score ?? 0) - level.min) / (level.max - level.min)) * 100)));
    const Menu = (Devvit.createElement("vstack", { width: "100%", height: "100%", alignment: "center middle" },
        Devvit.createElement("spacer", { grow: true }),
        Devvit.createElement("spacer", { height: "16px" }),
        Devvit.createElement(PixelText, { scale: 4 }, " Jigzle "),
        Devvit.createElement("spacer", { grow: true }),
        Devvit.createElement("vstack", { alignment: "center middle", onPress: () => setPage('level') },
            Devvit.createElement("hstack", null,
                Devvit.createElement("spacer", { width: "20px" }),
                Devvit.createElement(PixelText, { scale: 2 }, `Level ${props.userData.levelRank}`),
                Devvit.createElement("spacer", { width: "8px" }),
                Devvit.createElement(PixelSymbol, { type: "arrow-right", scale: 2, color: Settings.theme.tertiary })),
            Devvit.createElement("spacer", { height: "8px" }),
            Devvit.createElement(ProgressBar, { percentage: percentage, width: 256 })),
        Devvit.createElement("spacer", { grow: true }),
        Devvit.createElement("vstack", { alignment: "center middle", gap: "small" },
            Devvit.createElement(StyledButton, { width: buttonWidth, appearance: "primary", height: buttonHeight, onPress: () => setPage('create'), leadingIcon: "arrow-right", label: "Create", trailingIcon: "arrow-left" }),
            Devvit.createElement(StyledButton, { width: buttonWidth, appearance: "secondary", height: buttonHeight, onPress: () => setPage('my-drawings'), label: "MY EMBLEMS" }),
            Devvit.createElement(StyledButton, { width: buttonWidth, appearance: "secondary", height: buttonHeight, onPress: () => setPage('leaderboard'), label: "LEADERBOARD" }),
            Devvit.createElement(StyledButton, { width: buttonWidth, appearance: "secondary", height: buttonHeight, onPress: () => setPage('how-to-play'), label: "HOW TO PLAY" })),
        Devvit.createElement("spacer", { grow: true })));
    const onClose = () => {
        setPage('menu');
    };
    const pages = {
        menu: Menu,
        create: Devvit.createElement(EditorPage, { ...props, onCancel: onClose }),
        //'my-drawings': <MyDrawingsPage {...props} onClose={onClose} onDraw={() => setPage('create')} />,
        leaderboard: Devvit.createElement(LeaderboardPage, { ...props, onClose: onClose }),
        'how-to-play': Devvit.createElement(HowToPlayPage, { onClose: onClose }),
        //level: <LevelPage {...props} user={user} percentage={percentage} level={level} onClose={onClose} />
    };
    return pages[page] || Menu;
};
//# sourceMappingURL=PinnedPost.js.map