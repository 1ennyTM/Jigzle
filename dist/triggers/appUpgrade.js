import { Service } from '../service/Service.js';
export const appUpgrade = {
    event: 'AppUpgrade',
    onEvent: async (event, context) => {
        if (!event.subreddit) {
            return;
        }
        const service = new Service(context);
        const subreddit = await context.reddit.getSubredditInfoById(event.subreddit.id);
        if (!subreddit.name) {
            return;
        }
        await service.storeGameSettings({
            subredditName: subreddit.name,
        });
    },
};
//# sourceMappingURL=appUpgrade.js.map