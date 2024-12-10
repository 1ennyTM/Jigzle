import { Devvit, useAsync, useState } from '@devvit/public-api';

import { LoadingState } from '../components/LoadingState.js';
import { Service } from '../../service/Service.js';

//import { CollectionPost } from './collectionPost/CollectionPost.js';
//import { DrawingPost } from './drawingPost/DrawingPost.js';
import { PinnedPost } from './pinnedPost/PinnedPost.js';

import type { Context } from '@devvit/public-api';
import type { UserData } from '../../types/UserData.js';
import type { PostId } from '../../types/Id.js';
import type { DrawingPostData, CollectionPostData, PinnedPostData, PostData } from '../../types/PostData.js';
import type { GameSettings } from '../../types/GameSettings.js';

//import type { Dictionary } from '../types/Dictionary.js';
/*
 * Page Router
 *
 * This is the post type router and the main entry point for the custom post.
 * It handles the initial data loading and routing to the correct page based on the post type.
*/

// @ts-ignore 
export const Router: Devvit.CustomPostComponent = (context: Context) => {  
  const postId = context.postId as PostId;
  const [webviewVisible, setWebviewVisible] = useState(false);

  const service = new Service(context);

  const { data: username, loading: usernameLoading } = useAsync(
    async () => {
      if (!context.userId) return null; // Return early if no userId

      const cacheKey = 'cache:userId-username';
      const cache = await context.redis.hGet(cacheKey, context.userId);

      if (cache) {
        return cache;
      } 
      else {
        const user = await context.reddit.getUserById(context.userId);

        if (user) {
          await context.redis.hSet(cacheKey, {
            [context.userId]: user.username,
          });
          return user.username;
        }
      }
      return null;
    },{
      depends: [],
    }
  );

  const { data: gameSettings, loading: gameSettingsLoading } = useAsync<GameSettings>(
    async () => {
      return await service.getGameSettings();
  });


  const { data: postData, loading: postDataLoading } = useAsync<CollectionPostData | PinnedPostData | DrawingPostData>(
    async () => {
      const postType = await service.getPostType(postId);
      switch (postType) {
        case 'collection':
          return await service.getCollectionPost(postId);
        case 'pinned':
          return await service.getPinnedPost(postId);
        case 'drawing':
        default:
          return await service.getDrawingPost(postId);
      }
  });
/*
  const { data: dictionaries, loading: dictionariesLoading } = useAsync<Dictionary[]>(
    async () => {
      return await service.getActiveDictionaries();
  });
*/
  const {data: userData, loading: userDataLoading} = useAsync<UserData>(
    async () => {
      return await service.getUser(username!, postId);
    },{
      depends: [username],
    }
  );

  if (usernameLoading || 
    gameSettings === null || gameSettingsLoading ||
    postData === null || postDataLoading ||
    userData === null || userDataLoading
    //dictionaries === null || dictionariesLoading 
  ){
    return <LoadingState />;
  }

  const postType = postData.postType;
  const postTypes: Record<string, JSX.Element> = {
    pinned: (
      <PinnedPost
        postData={postData as PostData}
        userData={userData}
        username={username}
        gameSettings={gameSettings}
        webviewVisible = {webviewVisible}
        setWebviewVisible = {setWebviewVisible}
      />
    )
    /*
    drawing: (
      <DrawingPost
        postData={postData as DrawingPostData}
        userData={userData}
        username={username}
        gameSettings={gameSettings}
        webviewVisible = {webviewVisible}
        setWebviewVisible = {setWebviewVisible}
      />
    ),
    collection: <CollectionPost collection={postData as CollectionPostData} />

    // Add more post types here
    */
  };

  /*
   * Return the custom post unit
  */

  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={400}
        imageWidth={400}
        height="100%"
        width="100%"
        url="background.png"
        description="Full Bloom Pattern"
        resizeMode="cover"
      />
      {postTypes[postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
};