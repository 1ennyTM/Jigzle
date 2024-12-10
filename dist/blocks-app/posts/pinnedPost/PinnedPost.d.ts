import { Context } from '@devvit/public-api';
import { GameSettings } from '../../../types/GameSettings.js';
import type { PostData } from '../../../types/PostData.js';
import { UserData } from '../../../types/UserData.js';
interface PinnedPostProps {
    postData: PostData;
    userData: UserData;
    username: string | null;
    gameSettings: GameSettings;
}
export declare const PinnedPost: (props: PinnedPostProps, context: Context) => JSX.Element;
export {};
