import module from './module';

type MaybeToken = Token | undefined;

const getTokenFromSpeaker = (speaker: SpeakerType): MaybeToken => {
  if (!game.canvas.ready) {
    module.logger.info(`getTokenFromSpeaker bailed - canvas is not ready yet`);
    return undefined;
  }
  let token;
  if (speaker.token) {
    token = getTokenFromID(speaker.token);
  }
  if (!token && speaker.actor) {
    token = getTokenByActorID(speaker.actor);
  }
  return token;
};

const getTokenByActorID = (actorID: string): MaybeToken => game.canvas.tokens?.placeables.find((token) => token.document?.actorLink && token.actor?.id === actorID);

const getTokenFromID = (tokenID: string): MaybeToken => game.canvas.tokens?.get(tokenID);

export default getTokenFromSpeaker;
