import './jobs/firstSolveComment.js';
import './jobs/newEmblemPinnedComment.js';
import './jobs/userLeveledUp.js';
import { Devvit } from '@devvit/public-api';
import { Router } from './blocks-app/posts/Router.js';
import { installGame } from './actions/subreddit/installGame.js';
import { newPinnedPost } from './actions/subreddit/newPinnedPost.js';
import { appUpgrade } from './triggers/appUpgrade.js';
Devvit.configure({
    redditAPI: true,
    redis: true,
    media: true,
});
/*
* Custom Post
*/
Devvit.addCustomPostType({
    name: 'Jigzle',
    description: 'Jigzle - Router',
    height: 'tall',
    render: Router,
});
/*
* Subreddit Menu Actions
*/
Devvit.addMenuItem(installGame);
Devvit.addMenuItem(newPinnedPost);
//Devvit.addMenuItem(stopScoreboardJobs);
//Devvit.addMenuItem(createTopWeeklyDrawingPost);
/*
* Post Menu Actions
*/
//Devvit.addMenuItem(updateDrawingPostPreview);
//Devvit.addMenuItem(revealWord);
/*
 * Triggers
*/
Devvit.addTrigger(appUpgrade);
//Devvit.addTrigger(commentDelete);
export default Devvit;
//# sourceMappingURL=main.js.map