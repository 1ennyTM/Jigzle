import type { Context } from '@devvit/public-api';
import type { GameSettings } from '../../types/GameSettings.js';
interface WebviewContainerProps {
    username: string | null;
    gameSettings: GameSettings;
    onCancel: () => void;
}
export declare const WebviewContainer: (props: WebviewContainerProps, context: Context) => JSX.Element;
export {};
