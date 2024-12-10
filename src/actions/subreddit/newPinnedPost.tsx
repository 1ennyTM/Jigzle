import type { MenuItem } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { LoadingState } from '../../blocks-app/components/LoadingState.js'
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';

export const newPinnedPost: MenuItem = {
  label: '[Jigzle] New menu pinned post',
  location: 'subreddit',
  forUserType: 'moderator',

  onPress: async (_event, context) => {
    const { ui, reddit } = context;
    const service = new Service(context);
    const community = await context.reddit.getCurrentSubreddit();

    // Create a pinned post
    const post = await reddit.submitPost({
      title: Settings.pinnedPost.title,
      subredditName: community.name,
      preview: <LoadingState />,
    });

    // Pin the post
    await post.sticky();

    // Store the post data
    await service.savePinnedPost(post.id);

    ui.navigateTo(post);
    ui.showToast('Created new jigzle Pin Post!');
  },
};