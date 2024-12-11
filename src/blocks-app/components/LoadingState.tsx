import { Devvit } from '@devvit/public-api';

export const LoadingState = (): JSX.Element => (
  <zstack width="100%" height="100%" alignment="center middle">
    <image
      imageHeight={400}
      imageWidth={400}
      height="100%"
      width="100%"
      url="background.png"
      description="Full Bloom Pattern"
      resizeMode="cover"
    />
    <image
      url="loading.gif"
      description="Loading ..."
      imageHeight={1080}
      imageWidth={1080}
      width="128px"
      height="128px"
      resizeMode="scale-down"
    />
  </zstack>
);