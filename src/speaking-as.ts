import module from './module';
import * as utils from './utils';

const cssCurrentSpeaker = module.cssPrefix.child('current-speaker');
const cssTokenThumbnail = module.cssPrefix.child('token-thumbnail');

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(cssCurrentSpeaker);

const updateSpeaker = () => {
  const name = ChatMessage.getSpeaker().alias || '???';
  currentSpeakerDisplay.innerText = module.localize('currentSpeaker', { name });
};

const speakerImage = (imageSource: string) => `<img src="${encodeURI(imageSource || CONST.DEFAULT_TOKEN)}" class="${cssTokenThumbnail}">`;

const sortByName = (option1: { name: string }, option2: { name: string }) => option1.name.localeCompare(option2.name);
const releaseAllTokens = () => {
  game.canvas.tokens?.controlled.forEach((token) => token.release());
};

const getSpeakerOptions = () => {
  const speakerOptions: ContextMenuEntry[] = [];

  const tokens = game.canvas.tokens?.ownedTokens || [];
  for (const token of tokens) {
    speakerOptions.push({
      name: token.name,
      icon: speakerImage(token.document.texture.src),
      callback: () => {
        token.control();
        utils.panToToken(token);
      },
    });
  }
  speakerOptions.sort(sortByName);

  if (game.user && !game.user.character) {
    speakerOptions.unshift({
      name: game.user.name,
      icon: speakerImage(game.user.avatar),
      callback: releaseAllTokens,
    });
  }

  return speakerOptions;
};

Hooks.once('renderChatLog', (_application, element) => {
  const chatParent = element.get(0);
  const chatControls = chatParent?.querySelector('#chat-controls');
  if (!chatControls || chatControls.parentElement !== chatParent) {
    module.logger.error('Could not render Current Speaker Display - #chat-controls was not where it was expected');
    return;
  }
  chatParent.insertBefore(currentSpeakerDisplay, chatControls);

  const currentSpeakerToggleMenu = new ContextMenu($(chatParent), `.${cssCurrentSpeaker}`, [], {
    onOpen: () => {
      currentSpeakerToggleMenu.menuItems = getSpeakerOptions();
    },
  });

  updateSpeaker();

  currentSpeakerDisplay.addEventListener('mouseenter', (event) => {
    utils.hoverIn(event, ChatMessage.getSpeaker());
  });
  currentSpeakerDisplay.addEventListener('mouseleave', (event) => {
    utils.hoverOut(event);
  });
  currentSpeakerDisplay.addEventListener('dblclick', () => {
    utils.panToSpeaker(ChatMessage.getSpeaker());
  });
});

Hooks.on('controlToken', updateSpeaker);
