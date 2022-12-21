import getTokenFromSpeaker from './getTokenFromSpeaker';

it('returns undefind for a speaker with no token or actor', () => {
  const token = getTokenFromSpeaker({});
  expect(token).toBeUndefined();
});

it.todo('lookup by tokenID');
it.todo('lookup by tokenID, but canvas not ready');
it.todo('lookup by actorID');
it.todo('lookup by actorID, but canvas not ready');
it.todo('lookup by actorID, but actor not linked');
it.todo('lookup by tokenID, fallback to actorID');
it.todo('lookup by tokenID, fallback to actorID, but actor not linked');
