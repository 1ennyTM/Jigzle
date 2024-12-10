import Settings from '../settings.json';
import { getLevelByScore } from '../blocks-app/utils/progression.js';
// Service that handles the backbone logic for the application
// This service is responsible for:
// * Storing and fetching post data for drawings
// * Storing and fetching the score board
// * Storing and fetching user settings
// * Storing and fetching game settings
// * Storing and fetching dynamic dictionaries
export class Service {
    constructor(context) {
        this.tags = {
            scores: 'default',
        };
        this.keys = {
            //dictionary: (dictionaryName: string) => `dictionary:${dictionaryName}`,
            //dictionaries: 'dictionaries',
            gameSettings: 'game-settings',
            guessComments: (postId) => `guess-comments:${postId}`,
            postData: (postId) => `post:${postId}`,
            postGuesses: (postId) => `guesses:${postId}`,
            postSkipped: (postId) => `skipped:${postId}`,
            postSolved: (postId) => `solved:${postId}`,
            postUserGuessCounter: (postId) => `user-guess-counter:${postId}`,
            scores: `pixels:${this.tags.scores}`,
            userData: (username) => `users:${username}`,
            userDrawings: (username) => `user-drawings:${username}`,
            wordDrawings: (word) => `word-drawings:${word}`,
        };
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduler = context.scheduler;
    }
    /*
      * Submit Guess
      */
    async submitGuess(event) {
        if (!this.reddit || !this.scheduler) {
            console.error('Reddit API client or Scheduler not available in Service');
            return 0;
        }
        const [comment, guessCount] = await Promise.all([
            // Comment guess
            event.createComment
                ? this.reddit.submitComment({
                    id: event.postData.postId,
                    text: `I tried **${event.guess}**`,
                })
                : Promise.resolve(undefined),
            // Increment the counter for this guess
            this.redis.zIncrBy(this.keys.postGuesses(event.postData.postId), event.guess, 1),
        ]);
        const isCorrect = event.postData.word.toLowerCase() === event.guess;
        const isFirstSolve = isCorrect && guessCount === 1;
        const userPoints = isCorrect
            ? isFirstSolve
                ? Settings.guesserRewardForSolve + Settings.guesserRewardForFirstSolve
                : Settings.guesserRewardForSolve
            : 0;
        const promises = [
            // Increment the user's guess count
            this.redis.zIncrBy(this.keys.postUserGuessCounter(event.postData.postId), event.username, 1),
        ];
        // Save guess comment
        if (comment) {
            promises.push(this.saveGuessComment(event.postData.postId, event.guess, comment.id));
        }
        if (isCorrect) {
            // Persist that the user has solved the post and give points to drawer and guesser
            promises.push(this.redis.zAdd(this.keys.postSolved(event.postData.postId), {
                member: event.username,
                score: Date.now(),
            }), this.incrementUserScore(event.postData.authorUsername, Settings.authorRewardForCorrectGuess), this.incrementUserScore(event.username, userPoints));
        }
        // Comment to credit the first solver
        if (isFirstSolve) {
            const in5Min = new Date(Date.now() + 5 * 60 * 1000);
            promises.push(this.scheduler.runJob({
                name: 'FIRST_SOLVER_COMMENT',
                data: {
                    postId: event.postData.postId,
                    username: event.username,
                },
                runAt: in5Min,
            }));
        }
        await Promise.all(promises);
        return userPoints;
    }
    /*
      * Post User Guess Counter
      * A sorted set with the number of guesses made by each player
      * - Member: Username
      * - Score: Number of guesses made
      */
    async getPlayerCount(postId) {
        const key = this.keys.postUserGuessCounter(postId);
        return await this.redis.zCard(key);
    }
    /*
      * Post Guess Comments
      * A hash map of guesses with the commentIds backing them.
      */
    async getGuessComments(postId) {
        const key = this.keys.guessComments(postId);
        const data = await this.redis.hGetAll(key);
        // TODO: Update this so it doesn't blow up at scale
        const parsedData = {};
        Object.entries(data).forEach(([guess, commentId]) => {
            if (!parsedData[guess]) {
                parsedData[guess] = [];
            }
            parsedData[guess].push(commentId);
        });
        return parsedData;
    }
    async getGuessComment(postId, commentId) {
        const key = this.keys.guessComments(postId);
        return await this.redis.hGet(key, commentId);
    }
    async saveGuessComment(postId, guess, commentId) {
        await this.redis.hSet(this.keys.guessComments(postId), { [guess]: commentId });
    }
    async removeGuessComment(postId, commentId) {
        const key = this.keys.guessComments(postId);
        await this.redis.hDel(key, [commentId]);
    }
    /*
      * Pixels
      *
      * A sorted set for the in-game currency and scoreboard unit
      * - Member: Username
      * - Score: Number of pixels currently held
      */
    async getScores(maxLength = 10) {
        const options = { reverse: true, by: 'rank' };
        return await this.redis.zRange(this.keys.scores, 0, maxLength - 1, options);
    }
    async getUserScore(username) {
        const defaultValue = { rank: -1, score: 0 };
        if (!username)
            return defaultValue;
        try {
            const [rank, score] = await Promise.all([
                this.redis.zRank(this.keys.scores, username),
                // TODO: Remove .zScore when .zRank supports the WITHSCORE option
                this.redis.zScore(this.keys.scores, username),
            ]);
            return {
                rank: rank === undefined ? -1 : rank,
                score: score === undefined ? 0 : score,
            };
        }
        catch (error) {
            if (error) {
                console.error('Error fetching user score board entry', error);
            }
            return defaultValue;
        }
    }
    async incrementUserScore(username, amount) {
        if (this.scheduler === undefined) {
            console.error('Scheduler not available in Service');
            return 0;
        }
        const key = this.keys.scores;
        const prevScore = (await this.redis.zScore(key, username)) ?? 0;
        const nextScore = await this.redis.zIncrBy(key, username, amount);
        const prevLevel = getLevelByScore(prevScore);
        const nextLevel = getLevelByScore(nextScore);
        if (nextLevel.rank > prevLevel.rank) {
            await this.scheduler.runJob({
                name: 'USER_LEVEL_UP',
                data: {
                    username,
                    score: nextScore,
                    prevLevel,
                    nextLevel,
                },
                runAt: new Date(),
            });
        }
        return nextScore;
    }
    /*
      * Post Guesses
      *
      * A sorted set that tracks how many times each guess has been made:
      * - Member: Guess
      * - Score: Count
      */
    async getPostGuesses(postId) {
        const key = this.keys.postGuesses(postId);
        const data = await this.redis.zRange(key, 0, -1);
        const parsedData = {
            guesses: {},
            wordCount: 0,
            guessCount: 0,
        };
        data.forEach((value) => {
            const { member: guess, score: count } = value;
            parsedData.guesses[guess] = count;
            parsedData.guessCount += count;
            parsedData.wordCount += 1;
        });
        return parsedData;
    }
    /*
      * User Drawings
      *
      * All shared drawings are stored in a sorted set for each player:
      * - Member: Post ID
      * - Score: Unix epoch time
      */
    async getUserDrawings(username, options) {
        try {
            const key = this.keys.userDrawings(username);
            const start = options?.min ?? 0;
            const stop = options?.max ?? -1;
            const data = await this.redis.zRange(key, start, stop, {
                reverse: true,
                by: 'rank',
            });
            if (!data || data === undefined)
                return [];
            return data.map((value) => value.member);
        }
        catch (error) {
            if (error) {
                console.error('Error fetching user drawings:', error);
            }
            return [];
        }
    }
    /*
      * Post data
      */
    async getPostType(postId) {
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, 'postType');
        const defaultPostType = 'drawing';
        return postType ?? defaultPostType;
    }
    /*
      * Drawing Post data
      */
    async getDrawingPost(postId) {
        const [postData, solvedCount, skippedCount] = await Promise.all([
            // TODO: Use hMGet to only fetch needed fields when available
            this.redis.hGetAll(this.keys.postData(postId)),
            this.redis.zCard(this.keys.postSolved(postId)),
            this.redis.zCard(this.keys.postSkipped(postId)),
        ]);
        return {
            postId: postId,
            authorUsername: postData.authorUsername,
            data: JSON.parse(postData.data),
            date: parseInt(postData.date),
            word: postData.word,
            dictionaryName: postData.dictionaryName,
            solves: solvedCount,
            skips: skippedCount,
            postType: postData.postType,
        };
    }
    async getDrawingPosts(postIds) {
        return await Promise.all(postIds.map(async (postId) => {
            const key = this.keys.postData(postId);
            const stringifiedData = await this.redis.hGet(key, 'data');
            return {
                postId,
                data: stringifiedData ? JSON.parse(stringifiedData) : [],
            };
        }));
    }
    /*
    async updateDrawingPostPreview(
      postId: PostId,
      drawing: number[],
      playerCount: number,
      dictionaryName: string
    ): Promise<void> {
      const post = await this.reddit?.getPostById(postId);
      try {
        await post?.setCustomPostPreview(() => (
          <GuessScreenSkeleton
            drawing={drawing}
            playerCount={playerCount}
            dictionaryName={dictionaryName}
          />
        ));
      } catch (error) {
        console.error('Failed updating drawing preview', error);
      }
    }
    */
    /*
      * Skip Post
      */
    async skipPost(postId, username) {
        const key = this.keys.postSkipped(postId);
        await this.redis.zAdd(key, {
            member: username,
            score: Date.now(),
        });
    }
    /*
      * Handle drawing submissions
      */
    async submitDrawing(data) {
        if (!this.scheduler || !this.reddit) {
            console.error('submitDrawing: Scheduler/Reddit API client not available');
            return;
        }
        const key = this.keys.postData(data.postId);
        await Promise.all([
            // Save post object
            this.redis.hSet(key, {
                postId: data.postId,
                data: JSON.stringify(data.data),
                authorUsername: data.authorUsername,
                date: Date.now().toString(),
                word: data.word,
                dictionaryName: data.dictionaryName,
                postType: 'drawing',
            }),
            // Save the post to the user's drawings
            this.redis.zAdd(this.keys.userDrawings(data.authorUsername), {
                member: data.postId,
                score: Date.now(),
            }),
            // Save the post to the word's drawings
            this.redis.zAdd(this.keys.wordDrawings(data.word), {
                member: data.postId,
                score: Date.now(),
            }),
            // Schedule a job to pin the TLDR comment
            this.scheduler.runJob({
                name: 'DRAWING_PINNED_TLDR_COMMENT',
                data: { postId: data.postId },
                runAt: new Date(Date.now()),
            }),
            // Give points to the user for posting
            this.incrementUserScore(data.authorUsername, Settings.authorRewardForSubmit),
        ]);
    }
    /*
    * Game settings
    */
    async storeGameSettings(settings) {
        const key = this.keys.gameSettings;
        await this.redis.hSet(key, settings);
    }
    async getGameSettings() {
        const key = this.keys.gameSettings;
        return (await this.redis.hGetAll(key));
    }
    /*
      * Dictionary
      */
    /**
     * Saves a list of words to the specified dictionary. If the dictionary does not exist, it will be created.
     *
     * @param dictionaryName The name of the dictionary to save the words to.
     * @param newWords The list of words to save to the dictionary.
     * @returns The number of words that were added to the dictionary.
     */
    /*
    async upsertDictionary(
      dictionaryName: string,
      newWords: string[]
    ): Promise<{ rows: number; uniqueNewWords: string[]; duplicatesNotAdded: string[] }> {
      const key = this.keys.dictionary(dictionaryName);
      const existingJSON = await this.redis.get(key);
      const existingWords = existingJSON ? JSON.parse(existingJSON) : [];
  
      const uniqueNewWords = newWords.filter((word) => !existingWords.includes(word));
      const duplicatesNotAdded = newWords.filter((word) => existingWords.includes(word));
  
      const updatedWordsJson = JSON.stringify(Array.from(new Set([...existingWords, ...newWords])));
      await this.redis.set(key, updatedWordsJson);
      await this.redis.zAdd(this.keys.dictionaries, {
        member: dictionaryName,
        score: Date.now(),
      });
      return { rows: uniqueNewWords.length, uniqueNewWords, duplicatesNotAdded };
    }
  
    async removeWordFromDictionary(
      dictionaryName: string,
      wordsToRemove: string[]
    ): Promise<{ removedCount: number; removedWords: string[]; notFoundWords: string[] }> {
      const key = this.keys.dictionary(dictionaryName);
      const existingJSON = await this.redis.get(key);
      const existingWords: string[] = existingJSON ? JSON.parse(existingJSON) : [];
      const updatedWords = existingWords.filter((word) => !wordsToRemove.includes(word));
  
      const removedCount = existingWords.length - updatedWords.length;
      const removedWords = wordsToRemove.filter((word) => existingWords.includes(word));
      const notFoundWords = wordsToRemove.filter((word) => !removedWords.includes(word));
  
      const updatedWordsJson = JSON.stringify(updatedWords);
      await this.redis.set(key, updatedWordsJson);
      await this.redis.zAdd(this.keys.dictionaries, {
        member: dictionaryName,
        score: Date.now(),
      });
  
      return { removedCount, removedWords, notFoundWords };
    }
  
    async getActiveDictionaries(): Promise<Dictionary[]> {
      // Determine which dictionaries to fetch
      const gameSettings = await this.getGameSettings();
      const defaultDictionary = 'main';
      const dictionaries = [gameSettings.selectedDictionary];
      if (gameSettings.selectedDictionary !== defaultDictionary) {
        dictionaries.push(defaultDictionary);
      }
  
      // Fetch and parse the dictionaries
      return await Promise.all(
        dictionaries.map(async (dictionaryName) => {
          const key = this.keys.dictionary(dictionaryName);
          const dictionaryJsonString = await this.redis.get(key);
          const parsedDictionary: string[] = dictionaryJsonString
            ? JSON.parse(dictionaryJsonString)
            : [];
          return {
            name: dictionaryName,
            words: parsedDictionary,
          };
        })
      );
    }
  
    async selectDictionary(dictionaryName: string): Promise<void> {
      const gameSettings = await this.getGameSettings();
      gameSettings.selectedDictionary = dictionaryName;
      await this.storeGameSettings(gameSettings);
      await this.redis.zAdd(this.keys.dictionaries, {
        member: dictionaryName,
        score: Date.now(),
      });
    }
  
    async logDictionary(dictionaryName: string, username: string): Promise<void> {
      const data = await this.redis.get(this.keys.dictionary(dictionaryName));
      if (!data) return;
      const parsedData: string[] = JSON.parse(data);
      await this.reddit?.sendPrivateMessage({
        to: username,
        subject: `Dictionary: ${dictionaryName}`,
        text: `# Dictionary
        #### **Details**
        - Name: ${dictionaryName}
        - Word Count: ${parsedData.length}
        
        #### **Words**
        ${parsedData.map((word) => `- ${word}`).join('\n')}
        `,
      });
    }
  
    async getAllDictionaryNames(): Promise<string[]> {
      const data =
        (await this.redis.zRange(this.keys.dictionaries, 0, -1, {
          by: 'rank',
          reverse: true,
        })) ?? [];
      return data.map((value) => value.member);
    }
  
    async registerDictionary(dictionaryName: string): Promise<void> {
      await this.redis.zAdd(this.keys.dictionaries, {
        member: dictionaryName,
        score: Date.now(),
      });
    }
  
    async deleteDictionary(dictionaryName: string): Promise<void> {
      const defaultDictionary = 'main';
      if (!dictionaryName || dictionaryName === defaultDictionary) return;
      const currentDictionary = await this.redis.hGet(this.keys.gameSettings, 'selectedDictionary');
      await Promise.all([
        await this.redis.del(this.keys.dictionary(dictionaryName)),
        await this.redis.zRem(this.keys.dictionaries, [dictionaryName]),
        currentDictionary === dictionaryName
          ? await this.redis.hSet(this.keys.gameSettings, {
              selectedDictionary: defaultDictionary,
            })
          : Promise.resolve(undefined),
      ]);
    }
    */
    /*
      * Collections
    */
    async getPostDataFromSubredditPosts(posts, limit) {
        return await Promise.all(posts.map(async (post) => {
            const postType = await this.getPostType(post.id);
            if (postType === 'drawing') {
                return await this.getDrawingPost(post.id);
            }
            return null;
        })).then((results) => results.filter((postData) => postData !== null).slice(0, limit));
    }
    async storeCollectionPostData(data) {
        const key = this.keys.postData(data.postId);
        await this.redis.hSet(key, {
            postId: data.postId,
            data: JSON.stringify(data.data),
            timeframe: data.timeframe,
            postType: data.postType,
        });
    }
    async getCollectionPost(postId) {
        const key = this.keys.postData(postId);
        const post = await this.redis.hGetAll(key);
        return {
            postId,
            postType: 'collection',
            data: JSON.parse(post.data),
            timeframe: post.timeframe,
        };
    }
    /*
    * Pinned Post
    */
    async savePinnedPost(postId) {
        const key = this.keys.postData(postId);
        await this.redis.hSet(key, {
            postId,
            postType: 'pinned',
        });
    }
    async getPinnedPost(postId) {
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, 'postType');
        return {
            postId,
            postType: postType ?? 'pinned',
        };
    }
    /*
    * User Data and State Persistence
    */
    async saveUserData(username, data) {
        const key = this.keys.userData(username);
        const stringConfig = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]));
        await this.redis.hSet(key, stringConfig);
    }
    async getUser(username, postId) {
        const data = await this.redis.hGetAll(this.keys.userData(username));
        const solved = !!(await this.redis.zScore(this.keys.postSolved(postId), username));
        const skipped = !!(await this.redis.zScore(this.keys.postSkipped(postId), username));
        const guessCount = (await this.redis.zScore(this.keys.postUserGuessCounter(postId), username)) ?? 0;
        const user = await this.getUserScore(username);
        const level = getLevelByScore(user.score);
        const parsedData = {
            score: user.score,
            levelRank: data.levelRank ? parseInt(data.levelRank) : level.rank,
            levelName: data.levelName ?? level.name,
            solved,
            skipped,
            guessCount,
        };
        return parsedData;
    }
}
//# sourceMappingURL=Service.js.map