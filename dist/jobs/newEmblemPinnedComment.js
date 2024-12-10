import { Devvit } from '@devvit/public-api';
export const newDrawingPinnedComment = Devvit.addSchedulerJob({
    name: 'DRAWING_PINNED_TLDR_COMMENT',
    onRun: async (event, context) => {
        if (event.data) {
            try {
                const comment = await context.reddit.submitComment({
                    id: event.data.postId,
                    text: `Jigzle is an emblem maker and a jigsaw-puzzle game built for Reddit games and puzzles hackathon. To play, press the "Solve" button to start assembling the emblem or "Create" button to create your own emblem.`,
                });
                await comment.distinguish(true);
            }
            catch (error) {
                console.error('Failed to submit TLDR comment:', error);
            }
        }
    },
});
//# sourceMappingURL=newEmblemPinnedComment.js.map