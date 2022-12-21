import getTokenFromSpeaker from './getTokenFromSpeaker';

let lastHoveredToken: Token | null = null;
export const hoverIn = (event: Event, speaker: SpeakerType) => {
  const token = getTokenFromSpeaker(speaker);
  if (token && fireMouseEvent(token, 'hoverIn', event)) {
    lastHoveredToken = token;
  }
};

export const hoverOut = (event: Event) => {
  if (lastHoveredToken) {
    fireMouseEvent(lastHoveredToken, 'hoverOut', event);
    lastHoveredToken = null;
  }
};

const fireMouseEvent = (token: Token, type: 'hoverIn' | 'hoverOut', event: Event) => {
  if (token?.mouseInteractionManager.can(type, event)) {
    token.mouseInteractionManager.callback(type, event);
    return true;
  }
  return false;
};
