import module from './module';
import * as utils from './utils';

const cssPlayerName = module.cssPrefix.child('player-name');

Hooks.on('renderChatMessage', (message, element) => {
  if (!message.isContentVisible) {
    // Don't update whispers that the current player isn't privy to
    return;
  }
  const speaker = message.speaker;
  if (speaker && speaker.actor) {
    const messageParent = element.get(0);
    const messageSenderElem = messageParent?.querySelector('.message-sender');
    if (!messageSenderElem) {
      module.logger.error(`Could not update Chat Message sender for ${message.id} - .message-sender was not where it was expected`);
      return;
    }
    const playerName = message.user.name;
    const playerNameElem = document.createElement('span');
    playerNameElem.appendChild(document.createTextNode('['));
    playerNameElem.appendChild(document.createTextNode(playerName));
    playerNameElem.appendChild(document.createTextNode(']'));
    playerNameElem.classList.add(cssPlayerName);
    messageSenderElem.append(document.createTextNode(' '));
    messageSenderElem.append(playerNameElem);

    messageSenderElem.addEventListener('mouseenter', (event) => {
      utils.hoverIn(event, speaker);
    });
    messageSenderElem.addEventListener('mouseleave', (event) => {
      utils.hoverOut(event);
    });
    messageSenderElem.addEventListener('dblclick', () => {
      utils.panToSpeaker(speaker);
    });
  }
});
