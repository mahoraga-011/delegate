import { Series, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ProblemStatement } from "./scenes/01-ProblemStatement";
import { SolutionOverview } from "./scenes/02-SolutionOverview";
import { ArchitectureDiagram } from "./scenes/03-ArchitectureDiagram";
import { Contracts } from "./scenes/03b-Contracts";
import { TerminalDemo } from "./scenes/04-Terminal";
import { FlowDiagram } from "./scenes/05-FlowDiagram";
import { Summary } from "./scenes/06-Summary";

// Total: 300 + 270 + 360 + 300 + 1500 + 600 + 270 = 3600

export const DelegateVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade music out in last 60 frames
  const musicVolume = interpolate(
    frame,
    [0, 30, durationInFrames - 60, durationInFrames],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Background music — low volume, fades in/out */}
      <Audio
        src={staticFile("bg-music.mp3")}
        volume={musicVolume}
        loop
      />

      <Series>
        <Series.Sequence durationInFrames={300}>
          <ProblemStatement />
        </Series.Sequence>
        <Series.Sequence durationInFrames={270}>
          <SolutionOverview />
        </Series.Sequence>
        <Series.Sequence durationInFrames={360}>
          <ArchitectureDiagram />
        </Series.Sequence>
        <Series.Sequence durationInFrames={300}>
          <Contracts />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1500}>
          <TerminalDemo />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <FlowDiagram />
        </Series.Sequence>
        <Series.Sequence durationInFrames={270}>
          <Summary />
        </Series.Sequence>
      </Series>
    </>
  );
};
