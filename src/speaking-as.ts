import module from './module';
import * as utils from './utils';

const cssCurrentSpeaker = module.cssPrefix.child('current-speaker');
const cssTokenThumbnail = module.cssPrefix.child('token-thumbnail');

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(cssCurrentSpeaker);

function updateSpeaker() {
  currentSpeakerDisplay.innerText = game.i18n.format('illandril-chat-enhancements.currentSpeaker',
    { name: ChatMessage.getSpeaker().alias || '???' });
}

const speakerImage = (imageSource: string) => `<img src="${encodeURI(imageSource || CONST.DEFAULT_TOKEN)}" class="${cssTokenThumbnail}">`;

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
  speakerOptions.sort((option1, option2) => option1.name.localeCompare(option2.name));

  if (game.user && !game.user.character) {
    speakerOptions.unshift({
      name: game.user.name,
      icon: speakerImage(game.user.avatar),
      callback: () => {
        game.canvas.tokens?.controlled.forEach((token) => token.release());
      },
    });
  }

  return speakerOptions;
};

Hooks.once('renderChatLog', (_application, element) => {
  const chatParent = element.get(0);
  const chatControls = chatParent?.querySelector('#chat-controls');
  if (!chatControls || chatControls.parentElement !== chatParent) {
    module.logger.error('Could not render Current Speaker Display - #chat-controls wasn\'t where expected');
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
