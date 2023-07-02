import { getByText, screen } from '@testing-library/dom';
import Chance from 'chance';
import './sender-name';

const chance = new Chance();

jest.spyOn(game.settings, 'get').mockImplementation((namespace: string, key: string) => {
  if (namespace === 'illandril-chat-enhancements') {
    if (key === 'sender-name' || key === 'speaker-focus') {
      return true;
    }
  }
  throw new Error(`Not Mocked: game.settings.get(${JSON.stringify(namespace)}, ${JSON.stringify(key)})`);
});

const mockChatLog = (...chatMessages: HTMLLIElement[]) => {
  const chatSidebarTab = document.createElement('section');
  chatSidebarTab.classList.add('tab', 'sidebar-tab', 'chat-sidebar', 'directory', 'flexcol', 'active');
  chatSidebarTab.setAttribute('id', 'chat');
  chatSidebarTab.setAttribute('data-tab', 'chat');

  const chatLog = document.createElement('ol');
  chatLog.classList.add('chat-log');
  chatSidebarTab.appendChild(chatLog);

  for (const message of chatMessages) {
    chatLog.appendChild(message);
  }

  document.body.appendChild(chatSidebarTab);
};

const mockChatMessageElement = (messageId: string, name: string) => {
  const li = document.createElement('li');
  li.classList.add('chat-message', 'message', 'flexcol', 'ic');
  li.setAttribute('data-message-id', messageId);

  const header = document.createElement('header');
  header.classList.add('message-header', 'flexrow');
  li.appendChild(header);

  const sender = document.createElement('h4');
  sender.classList.add('message-sender');
  sender.appendChild(document.createTextNode(name));
  header.appendChild(sender);

  const metadata = document.createElement('span');
  metadata.classList.add('message-metadata');
  header.appendChild(metadata);
  const time = document.createElement('time');
  time.classList.add('message-timestamp');
  time.appendChild(document.createTextNode('1d 17h ago'));

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  messageContent.appendChild(document.createTextNode('The message content'));
  li.appendChild(messageContent);

  return li;
};

it('adds the user name after the speaker alias', () => {
  const messageId = chance.hash();
  const userName = chance.first();
  const speakerAlias = chance.first();
  const message = {
    id: messageId,
    isContentVisible: true,
    speaker: {
      actor: chance.hash(),
      alias: speakerAlias,
    },
    user: {
      name: userName,
    },
  } as Partial<ChatMessage> as unknown as ChatMessage;

  const element = mockChatMessageElement(messageId, speakerAlias);
  mockChatLog(element);

  const jQueryElement = {
    get: (index) => {
      if (index !== 0) {
        throw new Error(`Unexpected index: ${index}`);
      }
      return element;
    },
  } as Partial<JQuery<HTMLLIElement>> as unknown as JQuery;

  const senderName = screen.getByRole('heading', { level: 4 });
  expect(senderName.textContent).toBe(`${speakerAlias}`);

  Hooks.callAll('renderChatMessage', message, jQueryElement);

  expect(senderName.textContent).toBe(`${speakerAlias} [${userName}]`);

  const userNameElem = getByText(senderName, `[${userName}]`);
  expect(userNameElem).toHaveClass('illandril-chat-enhancements--player-name');
});

it.todo('doesn\'t modify private whispers');
it.todo('doesn\'t modify other chat messages');
it.todo('hover in/out');
it.todo('double click');
it.todo('sender-name setting on/off');
it.todo('speaker-focus setting on/off');
