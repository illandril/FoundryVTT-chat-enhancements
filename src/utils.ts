import module from './module';

function getThisSceneTokenObj(speaker: SpeakerType): Token | undefined {
  let token;
  if (speaker.token) {
    token = getTokenObj(speaker.token);
  }
  if (!token && speaker.actor) {
    token = getThisSceneTokenObjForActor(speaker.actor);
  }
  return token;
}

function getThisSceneTokenObjForActor(actorID: string): Token | undefined {
  let token;
  const sceneId = game.user?.viewedScene;
  if (sceneId) {
    const scene = game.scenes.get(sceneId);
    if (scene) {
      const thisSceneToken = scene.tokens.find((sceneToken) => sceneToken.actorId === actorID);
      if (thisSceneToken) {
        token = getTokenObj(thisSceneToken.id);
      }
    }
  }
  return token;
}

function getTokenObj(id: string): Token | undefined {
  if (!game.canvas.ready) {
    module.logger.info(`getTokenObj(${id}) bailed - canvas is not ready yet`);
    return undefined;
  }
  return game.canvas.tokens?.get(id);
}

let lastHoveredToken: Token | null = null;
export const hoverIn = (event: Event, speaker: SpeakerType) => {
  const token = getThisSceneTokenObj(speaker);
  if (token && fireMouseEvent(token, 'hoverIn', event)) {
    lastHoveredToken = token;
  }
};

export const hoverOut = (event: Event) => {
  if (lastHoveredToken) {
    fireMouseEvent(lastHoveredToken, 'hoverOut', event);
    lastHoveredToken = null;
  }
};

const fireMouseEvent = (token: Token, type: 'hoverIn' | 'hoverOut', event: Event) => {
  if (token && token.mouseInteractionManager.can(type, event)) {
    token.mouseInteractionManager.callback(type, event);
    return true;
  }
  return false;
};

export const panToSpeaker = (speaker: SpeakerType) => {
  panToToken(getThisSceneTokenObj(speaker));
};

export const panToToken = (token?: Token) => {
  if (token && token.isVisible) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    game.canvas.animatePan({ ...token.center, duration: 250 });
  }
};

export const hasTokenOnSheet = (actor: Actor) => !!getThisSceneTokenObjForActor(actor.id);

export const selectActorToken = (actor: Actor) => {
  const token = getThisSceneTokenObjForActor(actor.id);
  if (token) {
    token.control();
    panToToken(token);
  }
};
