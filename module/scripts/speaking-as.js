import { CSS_PREFIX } from './module.js';
import * as utils from './utils.js';

const CSS_CURRENT_SPEAKER = CSS_PREFIX + 'currentSpeaker';

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(CSS_CURRENT_SPEAKER);

const speakerOptions = [];
currentSpeakerDisplay.addEventListener(
  'contextmenu',
  (event) => {
    speakerOptions.splice(0, speakerOptions.length);
    const actors = game.actors.entities.filter(
      (a) => a.hasPerm(game.user, 'OWNER') && utils.hasTokenOnSheet(a)
    );
    for (let actor of actors) {
      speakerOptions.push({
        name: actor.name,
        icon: '',
        callback: () => {
          utils.selectActorToken(actor);
        },
      });
    }
  },
  false
);

function updateSpeaker() {
  currentSpeakerDisplay.innerText = game.i18n.format('illandril-chat-enhancements.currentSpeaker', {
    name: ChatMessage.getSpeaker().alias,
  });
}

Hooks.once('ready', () => {
  const chatControls = document.getElementById('chat-controls');
  chatControls.parentNode.insertBefore(currentSpeakerDisplay, chatControls);

  const currentSpeakerToggleMenu = new ContextMenu(
    $(chatControls.parentNode),
    '.' + CSS_CURRENT_SPEAKER,
    speakerOptions
  );

  updateSpeaker();

  const csd = $(currentSpeakerDisplay);
  csd.hover((event) => {
    utils.hoverIn(event, ChatMessage.getSpeaker());
  }, utils.hoverOut);
  csd.dblclick((event) => utils.panToSpeaker(ChatMessage.getSpeaker()));
});

Hooks.on('controlToken', updateSpeaker);
