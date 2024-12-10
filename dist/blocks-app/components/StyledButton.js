import { Devvit } from '@devvit/public-api';
import Settings from '../../settings.json';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';
import { Shadow } from './Shadow.js';
const disabledStyles = {
    primary: {
        backgroundColor: Settings.theme.tertiary,
        borderColor: Settings.theme.tertiary,
        fontColor: Settings.theme.background,
        iconColor: Settings.theme.background,
    },
    secondary: {
        backgroundColor: Settings.theme.background,
        borderColor: Settings.theme.tertiary,
        fontColor: Settings.theme.tertiary,
        iconColor: Settings.theme.tertiary,
    },
};
const styles = {
    primary: {
        backgroundColor: Settings.theme.primary,
        borderColor: Settings.theme.primary,
        fontColor: Settings.theme.background,
        iconColor: Settings.theme.background,
    },
    secondary: {
        backgroundColor: Settings.theme.background,
        borderColor: Settings.theme.primary,
        fontColor: Settings.theme.primary,
        iconColor: Settings.theme.primary,
    },
};
export const StyledButton = (props) => {
    const { onPress, leadingIcon, label, trailingIcon, appearance, width = '100px', height = '40px', } = props;
    const refererenceStyle = onPress === undefined ? disabledStyles : styles;
    const style = refererenceStyle[appearance || 'primary'];
    return (Devvit.createElement(Shadow, { height: height, width: width },
        Devvit.createElement("hstack", { height: height, width: width, onPress: onPress, backgroundColor: style.borderColor, padding: "xsmall" },
            Devvit.createElement("hstack", { height: "100%", width: "100%", gap: "small", alignment: "middle center", backgroundColor: style.backgroundColor },
                leadingIcon ? Devvit.createElement(PixelSymbol, { scale: 2, type: leadingIcon, color: style.iconColor }) : null,
                label ? Devvit.createElement(PixelText, { color: style.fontColor }, label) : null,
                trailingIcon ? Devvit.createElement(PixelSymbol, { scale: 2, type: trailingIcon, color: style.iconColor }) : null))));
};
//# sourceMappingURL=StyledButton.js.map