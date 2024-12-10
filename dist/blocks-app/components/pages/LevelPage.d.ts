import type { Context } from '@devvit/public-api';
import { Level } from '../types/Level.js';
import type { UserData } from '../types/UserData.js';
interface LevelPageProps {
    userData: UserData;
    user: {
        rank: number;
        score: number;
    };
    percentage: number;
    level: Level;
    onClose: () => void;
}
export declare const LevelPage: (props: LevelPageProps, context: Context) => JSX.Element;
export {};
