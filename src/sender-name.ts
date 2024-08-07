import { hoverIn, hoverOut } from './hover';
import module from './module';
import { panToSpeaker } from './panTo';
import { is5e3OrNewer } from './systems/dnd5e';

const senderNameSetting = module.settings.register('sender-name', Boolean, true, {
  hasHint: true,
  requiresReload: true,
});
const speakerFocusSetting = module.settings.register('speaker-focus', Boolean, true, {
  hasHint: true,
  requiresReload: true,
});

const cssPlayerName = module.cssPrefix.child('player-name');

const createPlayerNameElem = (message: ChatMessage) => {
  const playerName = message.author.name;

  const playerNameElem = document.createElement('span');

  playerNameElem.classList.add(cssPlayerName);

  playerNameElem.appendChild(document.createTextNode('['));
  playerNameElem.appendChild(document.createTextNode(playerName));
  playerNameElem.appendChild(document.createTextNode(']'));

  return playerNameElem;
};

const addSpeakerMouseListeners = (messageSenderElem: Element, speaker: SpeakerType) => {
  messageSenderElem.addEventListener('mouseenter', (event) => {
    hoverIn(event, speaker);
  });
  messageSenderElem.addEventListener('mouseleave', (event) => {
    hoverOut(event);
  });
  messageSenderElem.addEventListener('dblclick', () => {
    panToSpeaker(speaker);
  });
};

Hooks.on('renderChatMessage', (message, element) => {
  if (!message.isContentVisible) {
    // Don't update whispers that the current player isn't privy to
    return;
  }
  if (!message.speaker?.actor) {
    // Don't update messages that don't have an associated actor
    return;
  }

  const messageSenderElem = element.get(0)?.querySelector('.message-sender');

  if (!messageSenderElem) {
    module.logger.error(
      `Could not update Chat Message sender for ${message.id} - .message-sender was not where it was expected`,
    );
    return;
  }

  if (!is5e3OrNewer()) {
    if (senderNameSetting.get()) {
      messageSenderElem.append(document.createTextNode(' '));
      messageSenderElem.append(createPlayerNameElem(message));
    }
  }

  if (speakerFocusSetting.get()) {
    addSpeakerMouseListeners(messageSenderElem, message.speaker);
  }
});

Hooks.on('dnd5e.renderChatMessage', (message, element) => {
  if (!is5e3OrNewer()) {
    return;
  }

  if (!senderNameSetting.get()) {
    const senderSubtitle = element.querySelector<HTMLSpanElement>('.message-sender .name-stacked .subtitle');
    if (!senderSubtitle) {
      module.logger.warn('Could not find .name-stacked .subtitle in dnd5e ChatMessage element', message, element);
    } else {
      senderSubtitle.style.display = 'none';
    }
  }
});
