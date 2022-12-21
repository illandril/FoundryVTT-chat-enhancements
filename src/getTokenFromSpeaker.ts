import module from './module';

type MaybeToken = Token | undefined;

const getTokenFromSpeaker = (speaker: SpeakerType): MaybeToken => {
  let token;
  if (speaker.token) {
    token = getTokenFromID(speaker.token);
  }
  if (!token && speaker.actor) {
    token = getTokenByActorID(speaker.actor);
  }
  return token;
};

const getTokenByActorID = (actorID: string): MaybeToken => {
  if (!game.canvas.ready) {
    module.logger.info(`getTokenByActorID(${actorID}) bailed - canvas is not ready yet`);
    return undefined;
  }
  return game.canvas.tokens?.placeables.find((token) => token.document?.actorLink && token.actor?.id === actorID);
};

const getTokenFromID = (tokenID: string): MaybeToken => {
  if (!game.canvas.ready) {
    module.logger.info(`getTokenFromID(${tokenID}) bailed - canvas is not ready yet`);
    return undefined;
  }
  return game.canvas.tokens?.get(tokenID);
};

export default getTokenFromSpeaker;
