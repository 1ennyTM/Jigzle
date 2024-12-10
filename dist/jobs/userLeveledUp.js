import { Devvit } from '@devvit/public-api';
import { Service } from '../service/Service.js';
export const userLeveledUp = Devvit.addSchedulerJob({
    name: 'USER_LEVEL_UP',
    onRun: async (event, context) => {
        if (event.data) {
            try {
                const service = new Service(context);
                const gameSettings = await service.getGameSettings();
                await Promise.all([
                    context.reddit.sendPrivateMessage({
                        to: event.data.username,
                        subject: `Jigzle Level ${event.data.nextLevel.rank}!`,
                        text: `🎉 **Congratulations, Jigzler!** 🎉
    
    You've officially leveled up to **Level ${event.data.nextLevel.rank}: ${event.data.nextLevel.name}!** 🥳
    
    As a Level ${event.data.nextLevel.rank} player, you now enjoy some awesome perks:
    - **Exclusive** ${event.data.nextLevel.name} user flair to showcase your status!
    - **${event.data.nextLevel.extraTime} extra seconds** for each drawing! ⏳
    - **Bragging rights** that come with your new title!
    
    Don't forget to visit r/${gameSettings.subredditName} to flaunt your new flair and keep the creativity flowing! 🎨✨
    `,
                    }),
                    context.reddit.setUserFlair({
                        subredditName: gameSettings.subredditName,
                        username: event.data.username,
                        text: event.data.nextLevel.name,
                        backgroundColor: event.data.nextLevel.backgroundColor,
                        textColor: event.data.nextLevel.textColor,
                    }),
                    service.saveUserData(event.data.username, {
                        levelRank: event.data.nextLevel.rank,
                        levelName: event.data.nextLevel.name,
                    }),
                ]);
            }
            catch (error) {
                console.error(`Failed to process level up for ${event.data.username}`, error);
            }
        }
    },
});
//# sourceMappingURL=userLeveledUp.js.map