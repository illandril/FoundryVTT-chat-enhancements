const CSS_PREFIX = 'illandril-chat-enhancements--';
const CSS_CURRENT_SPEAKER = CSS_PREFIX + 'currentSpeaker';
const CSS_PLAYER_NAME = CSS_PREFIX + 'playerName';

const currentSpeakerDisplay = document.createElement('div');
currentSpeakerDisplay.classList.add(CSS_CURRENT_SPEAKER);

// hasPlayerOwner: 0.7.x, isPC: 0.6.x
const hasPlayerOwner = Entity.prototype.hasOwnProperty('hasPlayerOwner')
  ? (actor) => actor.hasPlayerOwner
  : (actor) => actor.isPC;

function updateSpeaker() {
  currentSpeakerDisplay.innerText = game.i18n.format('illandril-chat-enhancements.currentSpeaker', {
    name: ChatMessage.getSpeaker().alias,
  });
}

Hooks.once('ready', () => {
  const chatControls = document.getElementById('chat-controls');
  chatControls.parentNode.insertBefore(currentSpeakerDisplay, chatControls);
  updateSpeaker();

  const csd = $(currentSpeakerDisplay);
  csd.hover((event) => {
    hoverIn(event, ChatMessage.getSpeaker());
  }, hoverOut);
  csd.dblclick((event) => dblclick(event, ChatMessage.getSpeaker()));
});

Hooks.on('controlToken', updateSpeaker);

function isWhisperToOther(speakerInfo) {
  const whisper = speakerInfo.message.whisper;
  return whisper && whisper.length > 0 && whisper.indexOf(game.userId) === -1;
}

Hooks.on('renderChatMessage', (message, html, speakerInfo) => {
  if (isWhisperToOther(speakerInfo)) {
    // Don't update whispers that the current player isn't privy to
    return;
  }
  const speaker = speakerInfo.message.speaker;
  if (speaker && speaker.actor) {
    // It's a chat message associated with an actor

    const messageSenderElem = html.find('.message-sender');
    replaceSenderWithTokenName(messageSenderElem, speaker);
    appendPlayerName(messageSenderElem, speakerInfo.author);

    messageSenderElem.hover((event) => {
      hoverIn(event, speaker);
    }, hoverOut);
    messageSenderElem.dblclick((event) => dblclick(event, speaker));
  }
});

function replaceSenderWithTokenName(messageSenderElem, speaker) {
  messageSenderElem.text(getTokenName(speaker));
}

function appendPlayerName(messageSenderElem, author) {
  const playerName = author.name;
  const playerNameElem = document.createElement('span');
  playerNameElem.appendChild(document.createTextNode(playerName));
  playerNameElem.classList.add(CSS_PLAYER_NAME);
  messageSenderElem.append(playerNameElem);
}

function getTokenName(speaker) {
  if (speaker.token) {
    const token = getToken(speaker.scene, speaker.token);
    if (token) {
      return token.name;
    }
  }
  const actor = game.actors.get(speaker.actor);
  if (actor) {
    if (actor.data.token) {
      return actor.data.token.name;
    }
    if (hasPlayerOwner(actor)) {
      return actor.name;
    }
  }
  if (game.user.isGM) {
    return speaker.alias;
  }
  return '???';
}

function getToken(sceneID, tokenID) {
  const specifiedScene = game.scenes.get(sceneID);
  if (specifiedScene) {
    return getTokenForScene(specifiedScene, tokenID);
  }
  let foundToken = null;
  game.scenes.find((scene) => {
    foundToken = getTokenForScene(scene, tokenID);
    return !!foundToken;
  });
  return foundToken;
}

function getTokenForScene(scene, tokenID) {
  if (!scene) {
    return null;
  }
  return scene.data.tokens.find((token) => {
    return token._id === tokenID;
  });
}

function emptyNode(node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}

function getThisSceneTokenObj(speaker) {
  let token = getTokenObj(speaker.token);
  if (!token) {
    const scene = game.scenes.get(game.user.viewedScene);
    if (scene) {
      const thisSceneToken = scene.data.tokens.find((token) => {
        return token.actorLink && token.actorId === speaker.actor;
      });
      if (thisSceneToken) {
        token = getTokenObj(thisSceneToken._id);
      }
    }
  }
  return token;
}

function getTokenObj(id) {
  return canvas.tokens.get(id);
}

let lastHoveredToken = null;
function hoverIn(event, speaker) {
  let token = getThisSceneTokenObj(speaker);
  if (token && token.isVisible) {
    event.fromChat = true;
    token._onHoverIn(event);
    lastHoveredToken = token;
  }
}

function hoverOut(event) {
  if (lastHoveredToken && lastHoveredToken._hover) {
    event.fromChat = true;
    lastHoveredToken._onHoverOut(event);
    lastHoveredToken = null;
  }
}

function dblclick(event, speaker) {
  let token = getThisSceneTokenObj(speaker);
  if (token && token.isVisible) {
    canvas.animatePan({ ...token.center, duration: 250 });
  }
}
