import { CSS_PREFIX, log } from './module.js';
import * as utils from './utils.js';

const CSS_PLAYER_NAME = CSS_PREFIX + 'playerName';

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
      utils.hoverIn(event, speaker);
    }, utils.hoverOut);
    messageSenderElem.dblclick((event) => utils.panToSpeaker(speaker));
  }
});

function replaceSenderWithTokenName(messageSenderElem, speaker) {
  const actorName = (getActorName(speaker) || '').trim();
  const name = (getTokenName(speaker) || '').trim();
  if(actorName !== name) {
    replaceMatchingTextNodes(messageSenderElem[0], actorName, name);
  }
}

function replaceMatchingTextNodes(parent, match, replacement) {
  if(!parent.hasChildNodes()) {
    return;
  }
  for ( let node of parent.childNodes ) {
    if(node.nodeType === Node.TEXT_NODE) {
      if(node.wholeText.trim() === match) {
        node.parentNode.replaceChild(document.createTextNode(replacement), node);
      }
    } else {
      replaceMatchingTextNodes(node, match, replacement);
    }
  }
}

function appendPlayerName(messageSenderElem, author) {
  const playerName = author.name;
  const playerNameElem = document.createElement('span');
  playerNameElem.appendChild(document.createTextNode(playerName));
  playerNameElem.classList.add(CSS_PLAYER_NAME);
  messageSenderElem.append(playerNameElem);
}

function getActorName(speaker) {
  const actor = game.actors.get(speaker.actor);
  if (actor) {
    return actor.name;
  }
  return speaker.alias;
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
    if (actor.hasPlayerOwner) {
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
    return token.id === tokenID;
  });
}
