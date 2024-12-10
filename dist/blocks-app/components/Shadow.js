import { Devvit } from '@devvit/public-api';
import Settings from '../../settings.json';
export const Shadow = (props) => {
    const { height, width, children, onPress } = props;
    return (Devvit.createElement("zstack", { alignment: "start top", onPress: onPress },
        Devvit.createElement("vstack", { width: "100%", height: "100%" },
            Devvit.createElement("spacer", { height: "5px" }),
            Devvit.createElement("hstack", { width: "100%", height: "100%" },
                Devvit.createElement("spacer", { width: "5px" }),
                Devvit.createElement("hstack", { height: height, width: width, backgroundColor: Settings.theme.shadow2 }))),
        Devvit.createElement("vstack", { width: "100%", height: "100%" },
            Devvit.createElement("spacer", { height: "4px" }),
            Devvit.createElement("hstack", { width: "100%", height: "100%" },
                Devvit.createElement("spacer", { width: "4px" }),
                Devvit.createElement("hstack", { height: height, width: width, backgroundColor: Settings.theme.shadow }))),
        children));
};
//# sourceMappingURL=Shadow.js.map