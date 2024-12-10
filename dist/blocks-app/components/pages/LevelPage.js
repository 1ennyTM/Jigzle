import { Devvit, useState } from '@devvit/public-api';
import Levels from '../data/levels.json';
import Settings from '../settings.json';
import { Level } from '../types/Level.js';
import { abbreviateNumber } from '../utils/abbreviateNumber.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';
import { ProgressBar } from './ProgressBar.js';
import { StyledButton } from './StyledButton.js';
export const LevelPage = (props, context) => {
    const [level, setLevel] = useState(props.level.rank);
    const currentLevel = Levels[level - 1];
    // Rendering flags
    const isCurrentLevel = level === props.level.rank;
    const isFutureLevel = props.level.rank >= level;
    return (Devvit.createElement("vstack", { width: "100%", height: "100%" },
        Devvit.createElement("spacer", { height: "24px" }),
        Devvit.createElement("hstack", { grow: true },
            Devvit.createElement("spacer", { width: "24px" }),
            Devvit.createElement("zstack", { alignment: "start top", grow: true },
                Devvit.createElement("vstack", { width: "100%", height: "100%" },
                    Devvit.createElement("spacer", { height: "4px" }),
                    Devvit.createElement("hstack", { grow: true },
                        Devvit.createElement("spacer", { width: "4px" }),
                        Devvit.createElement("hstack", { grow: true, backgroundColor: Settings.theme.shadow }))),
                Devvit.createElement("vstack", { width: "100%", height: "100%" },
                    Devvit.createElement("hstack", { grow: true },
                        Devvit.createElement("vstack", { grow: true, backgroundColor: "white" },
                            Devvit.createElement("spacer", { height: "24px" }),
                            Devvit.createElement("vstack", { grow: true, alignment: "start top" },
                                Devvit.createElement("hstack", { width: "100%", alignment: "top" },
                                    Devvit.createElement("spacer", { width: "24px" }),
                                    Devvit.createElement("vstack", null,
                                        Devvit.createElement(PixelText, { scale: 2, color: Settings.theme.tertiary }, `Level ${currentLevel.rank}`),
                                        Devvit.createElement("spacer", { height: "8px" }),
                                        Devvit.createElement(PixelText, { scale: 3, color: Settings.theme.primary }, currentLevel.name)),
                                    Devvit.createElement("spacer", { grow: true }),
                                    Devvit.createElement(StyledButton, { appearance: "primary", label: "x", width: "32px", height: "32px", onPress: props.onClose }),
                                    Devvit.createElement("spacer", { width: "20px" })),
                                Devvit.createElement("spacer", { height: "20px" }),
                                Devvit.createElement("vstack", { width: "100%", alignment: "center middle" },
                                    Devvit.createElement(ProgressBar, { percentage: isCurrentLevel ? props.percentage : isFutureLevel ? 100 : 0, width: context?.dimensions?.width ? context.dimensions.width - 96 : 295 }),
                                    Devvit.createElement("spacer", { height: "8px" }),
                                    Devvit.createElement("hstack", { width: "100%" },
                                        Devvit.createElement("spacer", { width: "24px" }),
                                        Devvit.createElement(PixelText, { scale: 2, color: isCurrentLevel
                                                ? Settings.theme.primary
                                                : isFutureLevel
                                                    ? Settings.theme.primary
                                                    : 'rgba(0,0,0,0.4)' }, abbreviateNumber(currentLevel.min)),
                                        isCurrentLevel && (Devvit.createElement(Devvit.Fragment, null,
                                            Devvit.createElement("spacer", { grow: true }),
                                            Devvit.createElement(PixelText, { scale: 2, color: Settings.theme.orangered }, `${abbreviateNumber(props.user.score)} (${props.percentage}%)`))),
                                        Devvit.createElement("spacer", { grow: true }),
                                        Devvit.createElement(PixelText, { scale: 2, color: isCurrentLevel
                                                ? 'rgba(0,0,0,0.4)'
                                                : isFutureLevel
                                                    ? Settings.theme.primary
                                                    : 'rgba(0,0,0,0.4)' }, abbreviateNumber(currentLevel.max)),
                                        Devvit.createElement("spacer", { width: "24px" }))),
                                Devvit.createElement("spacer", { height: "48px" }),
                                Devvit.createElement("hstack", { width: "100%" },
                                    Devvit.createElement("spacer", { width: "24px" }),
                                    Devvit.createElement("vstack", { grow: true, alignment: "top start" },
                                        Devvit.createElement(PixelText, { scale: 2, color: Settings.theme.primary }, "Rewards:"),
                                        Devvit.createElement("spacer", { height: "24px" }),
                                        Devvit.createElement("hstack", null,
                                            Devvit.createElement(PixelSymbol, { type: "checkmark", scale: 2, color: props.level.rank < level ? 'rgba(0,0,0,0.2)' : Settings.theme.orangered }),
                                            Devvit.createElement("spacer", { width: "12px" }),
                                            Devvit.createElement("vstack", null,
                                                Devvit.createElement(PixelText, { scale: 2, color: Settings.theme.secondary }, `${currentLevel.extraTime} extra seconds`),
                                                Devvit.createElement("spacer", { height: "4px" }),
                                                Devvit.createElement(PixelText, { scale: 2, color: Settings.theme.secondary }, "when drawing"))),
                                        Devvit.createElement("spacer", { height: "24px" }),
                                        Devvit.createElement("hstack", null,
                                            Devvit.createElement(PixelSymbol, { type: "checkmark", scale: 2, color: props.level.rank < level ? 'rgba(0,0,0,0.2)' : Settings.theme.orangered }),
                                            Devvit.createElement("spacer", { width: "12px" }),
                                            Devvit.createElement(PixelText, { scale: 2, color: Settings.theme.secondary }, "Exclusive flair"))),
                                    Devvit.createElement("spacer", { width: "24px" })),
                                Devvit.createElement("spacer", { grow: true }),
                                Devvit.createElement("hstack", { width: "100%" },
                                    Devvit.createElement("spacer", { width: "24px" }),
                                    level > 1 && (Devvit.createElement(StyledButton, { appearance: "primary", leadingIcon: "arrow-left", width: "32px", height: "32px", onPress: () => setLevel(level - 1) })),
                                    Devvit.createElement("spacer", { grow: true }),
                                    level < Levels.length && (Devvit.createElement(StyledButton, { appearance: "primary", leadingIcon: "arrow-right", width: "32px", height: "32px", onPress: () => setLevel(level + 1) })),
                                    Devvit.createElement("spacer", { width: "20px" }))),
                            Devvit.createElement("spacer", { height: "20px" })),
                        Devvit.createElement("spacer", { width: "4px" })),
                    Devvit.createElement("spacer", { height: "4px" }))),
            Devvit.createElement("spacer", { width: "20px" })),
        Devvit.createElement("spacer", { height: "20px" })));
};
//# sourceMappingURL=LevelPage.js.map