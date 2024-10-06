import getSpeakerImage from './getSpeakerImage';

it.each([
  ['<img src="icons/svg/mock-default.svg" class="illandril-chat-enhancements--token-thumbnail">', null],
  ['<img src="icons/svg/mock-default.svg" class="illandril-chat-enhancements--token-thumbnail">', undefined],
  ['<img src="icons/svg/mock-default.svg" class="illandril-chat-enhancements--token-thumbnail">', ''],
  [
    '<img src="worlds/example/tokens/MockToken.png" class="illandril-chat-enhancements--token-thumbnail">',
    'worlds/example/tokens/MockToken.png',
  ],
  [
    '<img src="worlds/example/tokens/with%20escaped%20spaces.png" class="illandril-chat-enhancements--token-thumbnail">',
    'worlds/example/tokens/with%20escaped%20spaces.png',
  ],
  [
    '<img src="worlds/example/tokens/with unescaped spaces.png" class="illandril-chat-enhancements--token-thumbnail">',
    'worlds/example/tokens/with unescaped spaces.png',
  ],
  [
    '<img src="worlds/example/tokens/with&quot;quotes\'.png" class="illandril-chat-enhancements--token-thumbnail">',
    'worlds/example/tokens/with"quotes\'.png',
  ],
])('returns %j for %j', (expected, input) => {
  expect(getSpeakerImage(input)).toBe(expected);
});
