import type { Level } from '../../types/Level.js';
/**
 * Performs a binary search to find the users level based on their score value.
 *
 * @param score The score value to evaluate.
 * @returns The level object or a default level if not found.
 */
export declare function getLevelByScore(score?: number): Level;
/**
 * Get the level details for a given level rank.
 * @param rank The rank of the level to retrieve.
 * @returns The associated Level object
 */
export declare function getLevel(rank: number): Level;
