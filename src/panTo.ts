import getTokenFromSpeaker from './getTokenFromSpeaker';

export const panToSpeaker = (speaker: SpeakerType) => {
  panToToken(getTokenFromSpeaker(speaker));
};

export const panToToken = (token?: Token) => {
  if (token?.isVisible) {
    void game.canvas.animatePan({ ...token.center, duration: 250 });
  }
};
