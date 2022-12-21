import getTokenFromSpeaker from './getTokenFromSpeaker';

export const panToSpeaker = (speaker: SpeakerType) => {
  panToToken(getTokenFromSpeaker(speaker));
};

export const panToToken = (token?: Token) => {
  if (token?.isVisible) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    game.canvas.animatePan({ ...token.center, duration: 250 });
  }
};
