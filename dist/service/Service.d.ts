import type { Post, RedditAPIClient, RedisClient, Scheduler } from '@devvit/public-api';
import type { GameSettings } from '../types/GameSettings.js';
import type { CommentId, PostId } from '../types/Id.js';
import type { CollectionData, CollectionPostData, DrawingPostData, PinnedPostData } from '../types/PostData.js';
import type { PostGuesses } from '../types/PostGuesses.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import type { UserData } from '../types/UserData.js';
export declare class Service {
    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient;
    readonly scheduler?: Scheduler;
    constructor(context: {
        redis: RedisClient;
        reddit?: RedditAPIClient;
        scheduler?: Scheduler;
    });
    readonly tags: {
        scores: string;
    };
    readonly keys: {
        gameSettings: string;
        guessComments: (postId: PostId) => string;
        postData: (postId: PostId) => string;
        postGuesses: (postId: PostId) => string;
        postSkipped: (postId: PostId) => string;
        postSolved: (postId: PostId) => string;
        postUserGuessCounter: (postId: PostId) => string;
        scores: string;
        userData: (username: string) => string;
        userDrawings: (username: string) => string;
        wordDrawings: (word: string) => string;
    };
    submitGuess(event: {
        postData: DrawingPostData;
        username: string;
        guess: string;
        createComment: boolean;
    }): Promise<number>;
    getPlayerCount(postId: PostId): Promise<number>;
    getGuessComments(postId: PostId): Promise<{
        [guess: string]: string[];
    }>;
    getGuessComment(postId: PostId, commentId: CommentId): Promise<string | undefined>;
    saveGuessComment(postId: PostId, guess: string, commentId: string): Promise<void>;
    removeGuessComment(postId: PostId, commentId: CommentId): Promise<void>;
    getScores(maxLength?: number): Promise<ScoreBoardEntry[]>;
    getUserScore(username: string | null): Promise<{
        rank: number;
        score: number;
    }>;
    incrementUserScore(username: string, amount: number): Promise<number>;
    getPostGuesses(postId: PostId): Promise<PostGuesses>;
    getUserDrawings(username: string, options?: {
        min?: number;
        max?: number;
    }): Promise<string[]>;
    getPostType(postId: PostId): Promise<string>;
    getDrawingPost(postId: PostId): Promise<DrawingPostData>;
    getDrawingPosts(postIds: PostId[]): Promise<Pick<DrawingPostData, 'postId' | 'data'>[]>;
    skipPost(postId: PostId, username: string): Promise<void>;
    submitDrawing(data: {
        postId: PostId;
        word: string;
        dictionaryName: string;
        data: number[];
        authorUsername: string;
        subreddit: string;
    }): Promise<void>;
    storeGameSettings(settings: {
        [field: string]: string;
    }): Promise<void>;
    getGameSettings(): Promise<GameSettings>;
    /**
     * Saves a list of words to the specified dictionary. If the dictionary does not exist, it will be created.
     *
     * @param dictionaryName The name of the dictionary to save the words to.
     * @param newWords The list of words to save to the dictionary.
     * @returns The number of words that were added to the dictionary.
     */
    getPostDataFromSubredditPosts(posts: Post[], limit: number): Promise<CollectionData[]>;
    storeCollectionPostData(data: {
        postId: PostId;
        data: CollectionData[];
        timeframe: string;
        postType: string;
    }): Promise<void>;
    getCollectionPost(postId: PostId): Promise<CollectionPostData>;
    savePinnedPost(postId: PostId): Promise<void>;
    getPinnedPost(postId: PostId): Promise<PinnedPostData>;
    saveUserData(username: string, data: {
        [field: string]: string | number | boolean;
    }): Promise<void>;
    getUser(username: string, postId: PostId): Promise<UserData>;
}
