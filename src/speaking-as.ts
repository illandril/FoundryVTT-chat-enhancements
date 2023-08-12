import { hoverIn, hoverOut } from './hover';
import module from './module';
import { panToSpeaker, panToToken } from './panTo';

const speakingAsSetting = module.settings.register('speaking-as', Boolean, true, { hasHint: true, requiresReload: true });
const selectorSetting = module.settings.register('speaking-as-selector', Boolean, true, { hasHint: true, requiresReload: true });
const focusSetting = module.settings.register('speaking-as-focus', Boolean, true, { hasHint: true, requiresReload: true });

const cssCurrentSpeaker = module.cssPrefix.child('current-speaker');
const cssTokenThumbnail = module.cssPrefix.child('token-thumbnail');

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(cssCurrentSpeaker);

const updateSpeaker = () => {
  const name = ChatMessage.getSpeaker().alias || '???';
  currentSpeakerDisplay.innerText = module.localize('currentSpeaker', { name });
};

const speakerImage = (imageSource: string) => `<img src="${encodeURI(imageSource || foundry.CONST.DEFAULT_TOKEN)}" class="${cssTokenThumbnail}">`;

const sortByName = (option1: { name: string }, option2: { name: string }) => option1.name.localeCompare(option2.name);
const releaseAllTokens = () => {
  game.canvas.tokens?.controlled.forEach((token) => token.release());
};

const getSpeakerOptions = () => {
  const speakerOptions: ContextMenuEntry[] = [];

  const tokens = game.canvas.tokens?.ownedTokens || [];
  for (const token of tokens) {
    speakerOptions.push({
      name: token.name || 'Unknown',
      icon: speakerImage(token.document.texture.src),
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
      icon: speakerImage(game.user.avatar),
      callback: releaseAllTokens,
    });
  }

  return speakerOptions;
};

Hooks.once('renderChatLog', (_application, element) => {
  if (!speakingAsSetting.get()) {
    return;
  }

  const chatParent = element.get(0);
  const chatControls = chatParent?.querySelector('#chat-controls');
  if (!chatControls || chatControls.parentElement !== chatParent) {
    module.logger.error('Could not render Current Speaker Display - #chat-controls was not where it was expected');
    return;
  }
  chatParent.insertBefore(currentSpeakerDisplay, chatControls);

  if (selectorSetting.get()) {
    const currentSpeakerToggleMenu = new ContextMenu($(chatParent), `.${cssCurrentSpeaker}`, [], {
      onOpen: () => {
        currentSpeakerToggleMenu.menuItems = getSpeakerOptions();
      },
    });
  }

  updateSpeaker();

  if (focusSetting.get()) {
    currentSpeakerDisplay.addEventListener('mouseenter', (event) => {
      hoverIn(event, ChatMessage.getSpeaker());
    });
    currentSpeakerDisplay.addEventListener('mouseleave', (event) => {
      hoverOut(event);
    });
    currentSpeakerDisplay.addEventListener('dblclick', () => {
      panToSpeaker(ChatMessage.getSpeaker());
    });
  }
});

Hooks.on('controlToken', updateSpeaker);
