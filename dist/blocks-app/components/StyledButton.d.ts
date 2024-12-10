import { Devvit } from '@devvit/public-api';
import type { SupportedGlyphs } from './PixelSymbol.js';
interface StyledButtonProps {
    onPress?: () => void | Promise<void>;
    leadingIcon?: SupportedGlyphs;
    label?: string;
    trailingIcon?: SupportedGlyphs;
    appearance?: 'primary' | 'secondary';
    width?: Devvit.Blocks.SizeString;
    height?: Devvit.Blocks.SizeString;
}
export declare const StyledButton: (props: StyledButtonProps) => JSX.Element;
export {};
