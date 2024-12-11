import { Devvit,  useForm } from '@devvit/public-api';
import { Service } from '../../../service/Service.js';

import type { Context } from '@devvit/public-api';
import type { SaveEmblem } from '../../../types/BlockWebMessage.js';
import type { UserData } from '../../../types/UserData.js';
import type { GameSettings } from '../../../types/GameSettings.js';

interface EditorPageProps {
  username: string | null;
  gameSettings: GameSettings;
  userData: UserData;
  onCancel: () => void;
}

export const EditorPage = (props: EditorPageProps, context: Context): JSX.Element => {

    const service = new Service(context);

    const onCancel = useForm(
        {
          title: 'Are you sure?',
          description:
            "By canceling your emblem will not be saved or shared, no points will be gained",
          acceptLabel: 'Dont save',
          cancelLabel: 'return',
          fields: [],
        },
        async () => {
          props.onCancel();
          context.ui.showToast('Canceled');
        }
    );

    const onPostHandler = async (ev: SaveEmblem) => {
        console.log('Received message', ev);

        if (!props.username) {
            context.ui.showToast('Please log in to post');
            return;
        }

        if (ev.type === 'saveEmblem') {
            /*
            Add a temporary lock key to prevent duplicate posting.
            This lock will expire after 20 seconds.
            If the lock is already set return early.
            */
            const lockKey = `locked:${props.username}`;
            const locked = await context.redis.get(lockKey);

            if (locked === 'true') return;

            const lockoutPeriod = 20000; // 20 seconds
            await context.redis.set(lockKey, 'true', {
                nx: true,
                expiration: new Date(Date.now() + lockoutPeriod),
            });

            // The back-end is configured to run this app's submitPost calls as the user
            const post = await context.reddit.submitPost({
                title: 'Can you assemble this?',
                subredditName: props.gameSettings.subredditName,
                preview: (
                    <vstack>
                        <text>Loading...</text>
                    </vstack>
                ),
            });
            context.ui.showToast({text: 'Emblem saved to Redis!'});
            /*            
            service.submitEmblem({
                postId: post.id,
                data: props.drawing,
                authorUsername: props.username,
                subreddit: props.gameSettings.subredditName,
              });
            */
            context.ui.navigateTo(post);
        }
    }

    return (
        <webview 
        grow
        height="100%" 
        width="100%" 
        id="web-view"
        url="game.html"
        onMessage={(msg) => onPostHandler(msg as SaveEmblem)}
        />
    );
};