import { Devvit } from '@devvit/public-api';
export type LeaderboardRowProps = {
    rank: number;
    name: string;
    height: Devvit.Blocks.SizeString;
    score: number;
    onPress?: () => void;
};
export declare const LeaderboardRow: (props: LeaderboardRowProps) => JSX.Element;
