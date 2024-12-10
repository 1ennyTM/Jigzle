import { Devvit, useAsync, useState } from '@devvit/public-api';

//import { LevelPage } from '../../components/pages/LevelPage.js';
import { EditorPage } from '../../components/pages/EditorPage.js';
//import { MyDrawingsPage } from '../../components/MyDrawingsPage.js';
import { HowToPlayPage } from '../../components/pages/HowToPlayPage.js';
import { LeaderboardPage } from '../../components/pages/LeaderboardPage.js';

import { LoadingState } from '../../components/LoadingState.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { PixelText } from '../../components/PixelText.js';
import { ProgressBar } from '../../components/ProgressBar.js';
import { StyledButton } from '../../components/StyledButton.js';

import { Service } from '../../../service/Service.js';
import { getLevelByScore } from '../../utils/progression.js';

import Settings from '../../../settings.json';

import type { Context } from '@devvit/public-api';
import type { GameSettings } from '../../../types/GameSettings.js';
import type { PostData } from '../../../types/PostData.js';
import type { UserData } from '../../../types/UserData.js';


interface PinnedPostProps {
  postData: PostData;
  userData: UserData;
  username: string | null;
  gameSettings: GameSettings;
  webviewVisible: boolean;
  setWebviewVisible: (visible: boolean) => void;
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);

  const [page, setPage] = useState('menu');

  const buttonWidth = '256px';
  const buttonHeight = '48px';

  const { data: user, loading } = useAsync<{
    rank: number;
    score: number;
  }>(async () => {
    return await service.getUserScore(props.username);
  });

  if (user === null || loading) {
    return <LoadingState />;
  }

  const level = getLevelByScore(user?.score ?? 0);

/* 
  each level has a "min" and "max" score value
  the score can be inside or outside this range.
  I want the percentage to be calculated based on the user's score relative to the level's min and max score values.
  the score does not reset per level, so the user's score can be higher than the max score of the current level.
  If out of bounds, clip to 0 or 100.
*/
  const percentage = Math.round(
    Math.min(100, Math.max(0, (((user?.score ?? 0) - level.min) / (level.max - level.min)) * 100))
  );

  const Menu = (
    <vstack width="100%" height="100%" alignment="center middle">
      <spacer grow />
      <spacer height="16px" />

      {/* Wordmark */}
      <PixelText scale={4}> Jigzle </PixelText>

      <spacer grow />

      {/* Experience Bar */}
      <vstack alignment="center middle" onPress={() => setPage('level')}>
        <hstack>
          <spacer width="20px" />
          <PixelText scale={2}>{`Level ${props.userData.levelRank}`}</PixelText>
          <spacer width="8px" />
          <PixelSymbol type="arrow-right" scale={2} color={Settings.theme.tertiary} />
        </hstack>
        <spacer height="8px" />

        <ProgressBar percentage={percentage} width={256} />
      </vstack>

      <spacer grow />

      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <StyledButton
          width={buttonWidth}
          appearance="primary"
          height={buttonHeight}
          onPress={() => setPage('create')}
          leadingIcon="arrow-right"
          label="Create"
          trailingIcon="arrow-left"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('my-drawings')}
          label="MY EMBLEMS"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('leaderboard')}
          label="LEADERBOARD"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('how-to-play')}
          label="HOW TO PLAY"
        />
      </vstack>
      <spacer grow />

    </vstack>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const pages: Record<string, JSX.Element> = {
    menu: Menu,

    create: <EditorPage 
      {...props} 
      webviewVisible={props.webviewVisible} 
      setWebviewVisible={props.setWebviewVisible}  
      onCancel={onClose} 
    />,
    /*
    'my-drawings': <MyDrawingsPage 
      {...props} 
      webviewVisible={webviewVisible} 
      setWebviewVisible={setWebviewVisible}  
      onClose={onClose} 
      onDraw={() => setPage('create')} 
    />,
     */
    leaderboard: <LeaderboardPage 
      {...props} 
      onClose={onClose} 
    />,

    'how-to-play': <HowToPlayPage 
      onClose={onClose} 
    />,
    //level: <LevelPage {...props} user={user} percentage={percentage} level={level} onClose={onClose} />
  };

  return pages[page] || Menu;
};