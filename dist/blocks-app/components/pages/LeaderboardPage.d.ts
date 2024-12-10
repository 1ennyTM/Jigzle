import type { Context } from '@devvit/public-api';
interface LeaderboardPageProps {
    username: string | null;
    onClose: () => void;
}
export declare const LeaderboardPage: (props: LeaderboardPageProps, context: Context) => JSX.Element;
export {};
