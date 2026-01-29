import { Composition, registerRoot } from 'remotion';
import { ClarpQuickPromo } from './compositions/ClarpQuickPromo';
import { ClarpSaasPromo } from './compositions/ClarpSaasPromo';

const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ClarpQuickPromo"
        component={ClarpQuickPromo}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="ClarpSaasPromo"
        component={ClarpSaasPromo}
        durationInFrames={1020} // 17 seconds at 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

registerRoot(RemotionRoot);
