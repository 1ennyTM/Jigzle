import { Devvit, useState, useForm } from '@devvit/public-api';
import { Service } from '../../service/Service.js';
export const WebviewContainer = (props, context) => {
    const [webviewVisible, setWebviewVisible] = useState(true);
    const service = new Service(context);
    const onCancel = useForm({
        title: 'Are you sure?',
        description: "By canceling your emblem will not be saved or shared, no points will be gained",
        acceptLabel: 'Dont save',
        cancelLabel: 'return',
        fields: [],
    }, async () => {
        props.onCancel();
        setWebviewVisible(false);
        context.ui.showToast('Canceled');
    });
    const onPostHandler = async (ev) => {
        if (!props.username) {
            context.ui.showToast('Please log in to post');
            return;
        }
        console.log('Received message', ev);
        if (ev.type === 'saveEmblem') {
            /*
            Add a temporary lock key to prevent duplicate posting.
            This lock will expire after 20 seconds.
            If the lock is already set return early.
            */
            const lockKey = `locked:${props.username}`;
            const locked = await context.redis.get(lockKey);
            if (locked === 'true')
                return;
            const lockoutPeriod = 20000; // 20 seconds
            await context.redis.set(lockKey, 'true', {
                nx: true,
                expiration: new Date(Date.now() + lockoutPeriod),
            });
            // The back-end is configured to run this app's submitPost calls as the user
            const post = await context.reddit.submitPost({
                title: 'Can you assemble this?',
                subredditName: props.gameSettings.subredditName,
                preview: (Devvit.createElement("vstack", null,
                    Devvit.createElement("text", null, "Loading..."))),
            });
            context.ui.showToast({ text: 'Emblem saved to Redis!' });
            /*
            service.submitEmblem({
                postId: post.id,
                data: props.drawing,
                authorUsername: props.username,
                subreddit: props.gameSettings.subredditName,
              });

            context.ui.navigateTo(post);
            */
        }
    };
    return (Devvit.createElement("vstack", { grow: webviewVisible, height: webviewVisible ? '100%' : '0px' },
        Devvit.createElement("webview", { id: "game-webview", url: "game.html", grow: true, width: "100%", minWidth: "100%", onMessage: (msg) => onPostHandler(msg) })));
};
//# sourceMappingURL=WebviewContainer.js.map