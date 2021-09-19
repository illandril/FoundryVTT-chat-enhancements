import { CSS_PREFIX } from './module.js';
import * as utils from './utils.js';

const CSS_CURRENT_SPEAKER = CSS_PREFIX + 'currentSpeaker';

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(CSS_CURRENT_SPEAKER);

function updateSpeaker() {
  currentSpeakerDisplay.innerText = game.i18n.format('illandril-chat-enhancements.currentSpeaker', {
    name: ChatMessage.getSpeaker().alias,
  });
}

Hooks.once('renderChatLog', () => {
  const chatControls = document.getElementById('chat-controls');
  chatControls.parentNode.insertBefore(currentSpeakerDisplay, chatControls);

  const currentSpeakerToggleMenu = new ContextMenu(
    $(chatControls.parentNode),
    '.' + CSS_CURRENT_SPEAKER,
    []
  );
  const originalRender = currentSpeakerToggleMenu.render.bind(currentSpeakerToggleMenu);
  currentSpeakerToggleMenu.render = (...args) => {
    const actors = game.actors.contents.filter(
      (a) => a.isOwner && utils.hasTokenOnSheet(a)
    );
    const speakerOptions = [];
    for (let actor of actors) {
      speakerOptions.push({
        name: actor.name,
        icon: '',
        callback: () => {
          utils.selectActorToken(actor);
        },
      });
    }
    currentSpeakerToggleMenu.menuItems = speakerOptions;
    originalRender(...args);
  };


  updateSpeaker();

  const csd = $(currentSpeakerDisplay);
  csd.hover((event) => {
    utils.hoverIn(event, ChatMessage.getSpeaker());
  }, utils.hoverOut);
  csd.dblclick((event) => utils.panToSpeaker(ChatMessage.getSpeaker()));
});

Hooks.on('controlToken', updateSpeaker);
