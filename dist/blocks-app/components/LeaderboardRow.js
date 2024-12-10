import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { formatNumberWithCommas } from '../../blocks-app/utils/formatNumbers.js';
import Settings from '../../settings.json';
export const LeaderboardRow = (props) => {
    const { rank, name, height, score, onPress } = props;
    return (Devvit.createElement("zstack", { height: height, onPress: onPress },
        Devvit.createElement("hstack", { width: "100%", height: "100%", alignment: "start middle" },
            Devvit.createElement("spacer", { width: "12px" }),
            Devvit.createElement(PixelText, { color: Settings.theme.tertiary }, `${rank}.`),
            Devvit.createElement("spacer", { width: "8px" }),
            Devvit.createElement(PixelText, { color: Settings.theme.primary }, name)),
        Devvit.createElement("hstack", { width: "100%", height: "100%", alignment: "end middle" },
            Devvit.createElement("image", { url: "gradient-transparent-to-white.png", imageHeight: 1, imageWidth: 32, height: "100%", width: "32px", resizeMode: "fill" }),
            Devvit.createElement("hstack", { backgroundColor: "white", height: "100%", alignment: "middle" },
                Devvit.createElement("spacer", { width: "8px" }),
                Devvit.createElement(PixelText, { color: Settings.theme.primary }, formatNumberWithCommas(score)),
                Devvit.createElement("spacer", { width: "8px" }),
                Devvit.createElement(PixelSymbol, { color: Settings.theme.primary, type: "star" }),
                Devvit.createElement("spacer", { width: "12px" })))));
};
//# sourceMappingURL=LeaderboardRow.js.map