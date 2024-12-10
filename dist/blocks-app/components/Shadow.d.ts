import { Devvit } from '@devvit/public-api';
interface ShadowProps {
    height: Devvit.Blocks.SizeString;
    width: Devvit.Blocks.SizeString;
    children: JSX.Element;
    onPress?: () => void;
}
export declare const Shadow: (props: ShadowProps) => JSX.Element;
export {};
