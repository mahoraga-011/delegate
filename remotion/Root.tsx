import { Composition } from "remotion";
import { DelegateVideo } from "./DelegateVideo";

export const Root: React.FC = () => (
  <Composition
    id="DelegateDemo"
    component={DelegateVideo}
    durationInFrames={3600}
    fps={30}
    width={1920}
    height={1080}
  />
);
