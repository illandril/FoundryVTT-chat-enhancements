function getThisSceneTokenObj(speaker) {
  let token = getTokenObj(speaker.token);
  if (!token) {
    token = getThisSceneTokenObjForActor(speaker.actor);
  }
  return token;
}

function getThisSceneTokenObjForActor(actorID) {
  let token = null;
  const scene = game.scenes.get(game.user.viewedScene);
  if (scene) {
    const thisSceneToken = scene.data.tokens.find((token) => {
      return token.actorLink && token.actorId === actorID;
    });
    if (thisSceneToken) {
      token = getTokenObj(thisSceneToken._id);
    }
  }
  return token;
}

function getTokenObj(id) {
  return canvas.tokens.get(id);
}

let lastHoveredToken = null;
export const hoverIn = (event, speaker) => {
  let token = getThisSceneTokenObj(speaker);
  if (token && token.isVisible) {
    event.fromChat = true;
    token._onHoverIn(event);
    lastHoveredToken = token;
  }
};

export const hoverOut = (event) => {
  if (lastHoveredToken && lastHoveredToken._hover) {
    event.fromChat = true;
    lastHoveredToken._onHoverOut(event);
    lastHoveredToken = null;
  }
};

export const panToSpeaker = (speaker) => {
  panToToken(getThisSceneTokenObj(speaker));
};

const panToToken = (token) => {
  if (token && token.isVisible) {
    canvas.animatePan({ ...token.center, duration: 250 });
  }
}

export const hasTokenOnSheet = (actor) => {
  return !!getThisSceneTokenObjForActor(actor.id);
}

export const selectActorToken = (actor) => {
  let token = getThisSceneTokenObjForActor(actor.id);
  token.control();
  panToToken(token);
};
