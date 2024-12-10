import { Devvit } from '@devvit/public-api';
import Settings from '../../settings.json';
export const ProgressBar = (props) => {
    return (Devvit.createElement("zstack", { backgroundColor: Settings.theme.shadow, height: "8px", width: `${props.width}px`, alignment: "start middle" },
        Devvit.createElement("hstack", { backgroundColor: Settings.theme.orangered, height: "100%", width: `${props.percentage}%` })));
};
//# sourceMappingURL=ProgressBar.js.map