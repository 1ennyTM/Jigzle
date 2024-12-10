import type { UserData } from '../../../types/UserData.js';
import type { GameSettings } from '../../../types/GameSettings.js';
interface EditorPageProps {
    username: string | null;
    gameSettings: GameSettings;
    userData: UserData;
    onCancel: () => void;
}
export declare const EditorPage: (props: EditorPageProps) => JSX.Element;
export {};
