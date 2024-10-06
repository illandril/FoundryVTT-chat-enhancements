import { hoverIn, hoverOut } from '../hover';
import module from '../module';
import { panToSpeaker } from '../panTo';
import getSpeakerOptions from './getSpeakerOptions';

const speakingAsSetting = module.settings.register('speaking-as', Boolean, true, {
  hasHint: true,
  requiresReload: true,
});
const selectorSetting = module.settings.register('speaking-as-selector', Boolean, true, {
  hasHint: true,
  requiresReload: true,
});
const focusSetting = module.settings.register('speaking-as-focus', Boolean, true, {
  hasHint: true,
  requiresReload: true,
});

const cssCurrentSpeaker = module.cssPrefix.child('current-speaker');

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(cssCurrentSpeaker);

const updateSpeaker = () => {
  const name = ChatMessage.getSpeaker().alias || '???';
  currentSpeakerDisplay.innerText = module.localize('currentSpeaker', { name });
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
