import { Devvit } from '@devvit/public-api';
import { PixelText } from '.././PixelText.js';
import { StyledButton } from '.././StyledButton.js';
import Settings from '../../../settings.json';
export const HowToPlayPage = (props, _context) => (Devvit.createElement("vstack", { width: "100%", height: "100%" },
    Devvit.createElement("spacer", { height: "24px" }),
    Devvit.createElement("hstack", { width: "100%", alignment: "middle" },
        Devvit.createElement("spacer", { width: "24px" }),
        Devvit.createElement(PixelText, { scale: 2.5, color: Settings.theme.primary }, "How to play"),
        Devvit.createElement("spacer", { grow: true }),
        Devvit.createElement(StyledButton, { appearance: "primary", label: "x", width: "32px", height: "32px", onPress: props.onClose }),
        Devvit.createElement("spacer", { width: "20px" })),
    Devvit.createElement("spacer", { height: "20px" }),
    Devvit.createElement("hstack", { grow: true },
        Devvit.createElement("spacer", { width: "24px" }),
        Devvit.createElement("zstack", { alignment: "start top", grow: true },
            Devvit.createElement("vstack", { width: "100%", height: "100%" },
                Devvit.createElement("hstack", { grow: true },
                    Devvit.createElement("vstack", { grow: true, backgroundColor: "white" },
                        Devvit.createElement("spacer", { height: "4px" }),
                        Devvit.createElement("vstack", { grow: true, alignment: "center middle" },
                            Devvit.createElement(PixelText, { scale: 3 }, "Draw words"),
                            Devvit.createElement("spacer", { height: "4px" }),
                            Devvit.createElement(PixelText, { scale: 3 }, "for others"),
                            Devvit.createElement("spacer", { height: "16px" }),
                            Devvit.createElement(PixelText, { color: Settings.theme.secondary }, "Earn points if they"),
                            Devvit.createElement("spacer", { height: "4px" }),
                            Devvit.createElement(PixelText, { color: Settings.theme.secondary }, "guess correctly!")),
                        Devvit.createElement("spacer", { height: "4px" })),
                    Devvit.createElement("spacer", { width: "4px" })),
                Devvit.createElement("spacer", { height: "4px" }))),
        Devvit.createElement("spacer", { width: "20px" })),
    Devvit.createElement("spacer", { height: "20px" })));
//# sourceMappingURL=HowToPlayPage.js.map