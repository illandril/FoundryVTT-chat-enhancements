import { panToToken } from '../panTo';
import getSpeakerImage from './getSpeakerImage';
import releaseAllTokens from './releaseAllTokens';
import sortByName from './sortByName';

const getSpeakerOptions = () => {
  const speakerOptions: ContextMenuEntry[] = [];

  const tokens = game.canvas.tokens?.ownedTokens || [];
  for (const token of tokens) {
    speakerOptions.push({
      name: token.name || 'Unknown',
      icon: getSpeakerImage(token.document.texture.src),
      callback: () => {
        token.control();
        panToToken(token);
      },
    });
  }
  speakerOptions.sort(sortByName);

  if (game.user && !game.user.character) {
    speakerOptions.unshift({
      name: game.user.name,
      icon: getSpeakerImage(game.user.avatar),
      callback: releaseAllTokens,
    });
  }

  return speakerOptions;
};

export default getSpeakerOptions;
