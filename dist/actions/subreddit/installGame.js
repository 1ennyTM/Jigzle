import { Devvit } from '@devvit/public-api';
import { LoadingState } from '../../blocks-app/components/LoadingState.js';
//import Words from '../data/words.json';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
export const installGame = {
    label: '[Jigzle] Install game',
    location: 'subreddit',
    forUserType: 'moderator',
    onPress: async (_event, context) => {
        const { ui, reddit } = context;
        const service = new Service(context);
        const community = await reddit.getCurrentSubreddit();
        // Create a pinned post
        const post = await reddit.submitPost({
            title: Settings.pinnedPost.title,
            subredditName: community.name,
            preview: Devvit.createElement(LoadingState, null),
        });
        await Promise.all([
            // Pin the post
            post.sticky(),
            // Store the post data
            service.savePinnedPost(post.id),
            // Store the game settings
            service.storeGameSettings({
                subredditName: community.name,
            }),
            //service.upsertDictionary('main', Words),
        ]);
        ui.navigateTo(post);
        ui.showToast('Installed Jigzle!');
    },
};
//# sourceMappingURL=installGame.js.map