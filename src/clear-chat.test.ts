import { CheckEveryMessage, CheckOnLoad, Confirm, Target, Trigger } from './clear-chat';
import module from './module';

// biome-ignore lint/style/useNamingConvention: Not our name
(window as { ChatMessage: { deleteDocuments: typeof ChatMessage.deleteDocuments } }).ChatMessage = {
  deleteDocuments: jest.fn(),
};

const mockMessages: {
  size: number;
  reduce: typeof game.messages.reduce;
} = {
  size: 0,
  reduce: (reducer, initial) => {
    let value = initial;
    for (let i = 0; i < mockMessages.size; i++) {
      value = reducer(
        value,
        {
          id: `mock-message-id-${i}`,
        } as ChatMessage,
        i,
        game.messages,
      );
    }
    return value;
  },
};

(game as { messages: Partial<typeof game.messages> }).messages = mockMessages;

const infoSpy = jest.spyOn(ui.notifications, 'info');
const warnSpy = jest.spyOn(module.logger, 'warn');
const errorSpy = jest.spyOn(module.logger, 'error');
const confirmSpy = jest.fn<ReturnType<typeof Dialog.confirm<void>>, Parameters<typeof Dialog.confirm<void>>>();
// biome-ignore lint/style/useNamingConvention: Not our name
(window as unknown as { Dialog: { confirm: typeof Dialog.confirm<void> } }).Dialog = {
  confirm: confirmSpy,
};
jest.spyOn(foundry.utils, 'debounce').mockImplementation((fn) => fn);

beforeAll(() => {
  Hooks.callAll('init');
});

beforeEach(() => {
  jest.useFakeTimers();
  infoSpy.mockImplementation(() => {
    throw new Error('Unexpected call to ui.notifications.info');
  });
  warnSpy.mockImplementation((...args) => {
    throw new Error(`Unexpected module.logger.warn call...\n${args.map((arg) => JSON.stringify(arg)).join(', ')}`);
  });
  errorSpy.mockImplementation((...args) => {
    throw new Error(`Unexpected module.logger.error call...\n${args.map((arg) => JSON.stringify(arg)).join(', ')}`);
  });
  confirmSpy.mockImplementation(() => {
    throw new Error('Unexpected call to Dialog.confirm');
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Disabled', () => {
  beforeEach(() => {
    CheckOnLoad.set(false);
    Confirm.set(false);
    Trigger.set(1000);
    Target.set(500);
    (game.user as { isGM: boolean }).isGM = true;
    mockMessages.size = 10000;
  });

  it('does not try to delete any messages even if past trigger threshold', async () => {
    Hooks.callAll('ready');
    await jest.runAllTimersAsync();

    expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
  });
});

describe('Enabled', () => {
  beforeEach(() => {
    CheckEveryMessage.set(false);
    CheckOnLoad.set(true);
  });

  describe('GM', () => {
    beforeEach(() => {
      (game.user as { isGM: boolean }).isGM = true;
    });

    describe('confirm = false', () => {
      beforeEach(() => {
        Confirm.set(false);
      });

      it('deletes messages without showing a confirmation prompt', async () => {
        Trigger.set(1000);
        Target.set(500);
        mockMessages.size = 1001;
        infoSpy.mockImplementation(() => 1234);
        warnSpy.mockImplementation(() => undefined);

        Hooks.callAll('ready');
        await jest.runAllTimersAsync();

        expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
        const expectedDeleted = Array.from(
          {
            length: 501,
          },
          (_x, i) => `mock-message-id-${i}`,
        );
        expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith(
          'mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"501"}]',
        );

        expect(warnSpy).toHaveBeenCalledTimes(3);
        expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
        expect(warnSpy).toHaveBeenCalledWith('Deleting', 501, 'messages');
        expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 501, 'messages');
      });

      describe.each([100, 500, 1000])('trigger=%i, target=50', (trigger) => {
        // biome-ignore lint/suspicious/noDuplicateTestHooks: Not a duplicate... trigger is different each loop
        beforeEach(() => {
          Trigger.set(trigger);
          Target.set(50);
        });

        it('does not deletes messages if no messages', async () => {
          mockMessages.size = 0;

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('does not deletes messages if below the trigger', async () => {
          mockMessages.size = trigger - 1;

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('does not deletes messages if at the trigger', async () => {
          mockMessages.size = trigger;

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('deletes messages if just above the trigger', async () => {
          mockMessages.size = trigger + 1;
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: trigger - 49,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"${trigger - 49}"}]`,
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', trigger - 49, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', trigger - 49, 'messages');
        });

        it('deletes messages if well above the trigger', async () => {
          mockMessages.size = 10000;
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 9950,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            'mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"9950"}]',
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 9950, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 9950, 'messages');
        });
      });

      describe.each([100, 500, 1000])('trigger=1000, target=%i', (target) => {
        // biome-ignore lint/suspicious/noDuplicateTestHooks: Not a duplicate... target is different each loop
        beforeEach(() => {
          Trigger.set(1000);
          Target.set(target);
        });

        it('does not deletes messages if at the trigger', async () => {
          mockMessages.size = 1000;

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('deletes messages down to the target if above the trigger', async () => {
          mockMessages.size = 1001;
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 1001 - target,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"${1001 - target}"}]`,
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 1001 - target, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 1001 - target, 'messages');
        });

        it('deletes messages down to the target if well above the trigger', async () => {
          mockMessages.size = 10000;
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 10000 - target,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"${10000 - target}"}]`,
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 10000 - target, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 10000 - target, 'messages');
        });
      });

      it('deletes all messages if trigger=0, target=0', async () => {
        Trigger.set(0);
        Target.set(0);
        mockMessages.size = 1000;
        infoSpy.mockImplementation(() => 1234);
        warnSpy.mockImplementation(() => undefined);

        Hooks.callAll('ready');
        await jest.runAllTimersAsync();

        expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
        const expectedDeleted = Array.from(
          {
            length: 1000,
          },
          (_x, i) => `mock-message-id-${i}`,
        );
        expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith(
          `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"1000"}]`,
        );

        expect(warnSpy).toHaveBeenCalledTimes(3);
        expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
        expect(warnSpy).toHaveBeenCalledWith('Deleting', 1000, 'messages');
        expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 1000, 'messages');
      });

      it('does not try to delete any messages if trigger < target', async () => {
        Trigger.set(500);
        Target.set(1000);
        mockMessages.size = 10000;

        errorSpy.mockImplementation(() => undefined);

        Hooks.callAll('ready');
        await jest.runAllTimersAsync();

        expect(errorSpy).toHaveBeenCalledWith(
          'Chat Log not cleared - Clear Trigger cannot be less than the Clear Target',
          500,
          1000,
        );
        expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
      });

      it('does not try to delete any messages if target < 0', async () => {
        Trigger.set(-1);
        Target.set(-2);
        mockMessages.size = 10000;

        errorSpy.mockImplementation(() => undefined);

        Hooks.callAll('ready');
        await jest.runAllTimersAsync();

        expect(errorSpy).toHaveBeenCalledWith('Chat Log not cleared - Clear Target cannot be negative', -2);
        expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
      });
    });

    describe('confirm = true', () => {
      beforeEach(() => {
        Confirm.set(true);
      });

      describe('trigger=750, target=400, messages=5000', () => {
        beforeEach(() => {
          Trigger.set(750);
          Target.set(400);
          mockMessages.size = 5000;
        });

        it('shows a confirmation prompt', async () => {
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(confirmSpy).toHaveBeenCalledTimes(1);
          expect(confirmSpy).toHaveBeenCalledWith({
            title: 'mock-localize[illandril-chat-enhancements.clear-chat.confirm.title]',
            content:
              '<div class="illandril-chat-enhancements--clear-chat--confirm-message">mock-format[illandril-chat-enhancements.clear-chat.confirm.message][{"count":"4600","total":"5000","trigger":"750","target":"400"}]</div>',
            yes: expect.any(Function) as Parameters<typeof Dialog.confirm>[0]['yes'],
            no: expect.any(Function) as Parameters<typeof Dialog.confirm>[0]['no'],
            defaultYes: false,
          });
        });
      });

      describe('trigger=1000, target=500, messages=1001', () => {
        beforeEach(() => {
          Trigger.set(1000);
          Target.set(500);
          mockMessages.size = 1001;
        });

        it('shows a confirmation prompt', async () => {
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(confirmSpy).toHaveBeenCalledTimes(1);
          expect(confirmSpy).toHaveBeenCalledWith({
            title: 'mock-localize[illandril-chat-enhancements.clear-chat.confirm.title]',
            content:
              '<div class="illandril-chat-enhancements--clear-chat--confirm-message">mock-format[illandril-chat-enhancements.clear-chat.confirm.message][{"count":"501","total":"1001","trigger":"1000","target":"500"}]</div>',
            yes: expect.any(Function) as Parameters<typeof Dialog.confirm>[0]['yes'],
            no: expect.any(Function) as Parameters<typeof Dialog.confirm>[0]['no'],
            defaultYes: false,
          });
        });

        it('deletes after clicking yes', async () => {
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
          expect(infoSpy).not.toHaveBeenCalled();
          expect(warnSpy).not.toHaveBeenCalled();

          confirmSpy.mock.lastCall![0].yes(document.createElement('div'));
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 501,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(confirmSpy).toHaveBeenCalledTimes(1);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            'mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"501"}]',
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - cleanup confirmed');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 501, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 501, 'messages');
        });

        it('does not delete after clicking no', async () => {
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(warnSpy).not.toHaveBeenCalled();

          confirmSpy.mock.lastCall![0].no(document.createElement('div'));
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();

          expect(confirmSpy).toHaveBeenCalledTimes(1);

          expect(infoSpy).not.toHaveBeenCalled();

          expect(warnSpy).toHaveBeenCalledTimes(1);
          expect(warnSpy).toHaveBeenCalledWith('Not cleaning up Chat - cleanup not confirmed');
        });
      });

      describe.each([100, 500, 1000])('trigger=%i, target=50', (trigger) => {
        // biome-ignore lint/suspicious/noDuplicateTestHooks: Not a duplicate... trigger is different each loop
        beforeEach(() => {
          Trigger.set(trigger);
          Target.set(50);
        });

        it('does not deletes messages if no messages', async () => {
          mockMessages.size = 0;

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(confirmSpy).not.toHaveBeenCalled();
          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('does not deletes messages if below the trigger', async () => {
          mockMessages.size = trigger - 1;
          confirmSpy.mockImplementation(() => Promise.resolve(null));

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(confirmSpy).not.toHaveBeenCalled();
          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('does not deletes messages if at the trigger', async () => {
          mockMessages.size = trigger;
          confirmSpy.mockImplementation(() => Promise.resolve(null));

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(confirmSpy).not.toHaveBeenCalled();
          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('deletes messages if just above the trigger', async () => {
          mockMessages.size = trigger + 1;
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();
          confirmSpy.mock.lastCall![0].yes(document.createElement('div'));
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: trigger - 49,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(confirmSpy).toHaveBeenCalledTimes(1);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"${trigger - 49}"}]`,
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - cleanup confirmed');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', trigger - 49, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', trigger - 49, 'messages');
        });

        it('deletes messages if well above the trigger', async () => {
          mockMessages.size = 10000;
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();
          confirmSpy.mock.lastCall![0].yes(document.createElement('div'));
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 9950,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(confirmSpy).toHaveBeenCalledTimes(1);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            'mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"9950"}]',
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - cleanup confirmed');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 9950, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 9950, 'messages');
        });
      });

      describe.each([100, 500, 1000])('trigger=1000, target=%i', (target) => {
        // biome-ignore lint/suspicious/noDuplicateTestHooks: Not a duplicate... target is different each loop
        beforeEach(() => {
          Trigger.set(1000);
          Target.set(target);
        });

        it('does not deletes messages if at the trigger', async () => {
          mockMessages.size = 1000;

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();

          expect(confirmSpy).not.toHaveBeenCalled();
          expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        });

        it('deletes messages down to the target if above the trigger', async () => {
          mockMessages.size = 1001;
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();
          confirmSpy.mock.lastCall![0].yes(document.createElement('div'));
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 1001 - target,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(confirmSpy).toHaveBeenCalledTimes(1);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"${1001 - target}"}]`,
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - cleanup confirmed');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 1001 - target, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 1001 - target, 'messages');
        });

        it('deletes messages down to the target if well above the trigger', async () => {
          mockMessages.size = 10000;
          confirmSpy.mockImplementation(() => Promise.resolve(null));
          infoSpy.mockImplementation(() => 1234);
          warnSpy.mockImplementation(() => undefined);

          Hooks.callAll('ready');
          await jest.runAllTimersAsync();
          confirmSpy.mock.lastCall![0].yes(document.createElement('div'));
          await jest.runAllTimersAsync();

          expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
          const expectedDeleted = Array.from(
            {
              length: 10000 - target,
            },
            (_x, i) => `mock-message-id-${i}`,
          );
          expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

          expect(confirmSpy).toHaveBeenCalledTimes(1);

          expect(infoSpy).toHaveBeenCalledTimes(1);
          expect(infoSpy).toHaveBeenCalledWith(
            `mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"${10000 - target}"}]`,
          );

          expect(warnSpy).toHaveBeenCalledTimes(3);
          expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - cleanup confirmed');
          expect(warnSpy).toHaveBeenCalledWith('Deleting', 10000 - target, 'messages');
          expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 10000 - target, 'messages');
        });
      });
    });

    describe('check-every-message = false', () => {
      beforeEach(() => {
        CheckEveryMessage.set(false);
        Confirm.set(false);
        Trigger.set(1000);
        Target.set(500);
        mockMessages.size = 1001;
      });

      it('does not delete messages on createChatMessage', async () => {
        Trigger.set(1000);
        Target.set(500);
        mockMessages.size = 1001;
        infoSpy.mockImplementation(() => 1234);
        warnSpy.mockImplementation(() => undefined);

        Hooks.callAll('createChatMessage', {} as foundry.abstract.Document, {}, {});
        await jest.runAllTimersAsync();

        expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });

    describe('check-every-message = true', () => {
      beforeEach(() => {
        CheckEveryMessage.set(true);
        Confirm.set(false);
      });

      it('deletes messages on createChatMessage if past trigger', async () => {
        Trigger.set(1000);
        Target.set(500);
        mockMessages.size = 1001;
        infoSpy.mockImplementation(() => 1234);
        warnSpy.mockImplementation(() => undefined);

        expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();

        Hooks.callAll('createChatMessage', {} as foundry.abstract.Document, {}, {});
        await jest.runAllTimersAsync();

        expect(ChatMessage.deleteDocuments).toHaveBeenCalledTimes(1);
        const expectedDeleted = Array.from(
          {
            length: 501,
          },
          (_x, i) => `mock-message-id-${i}`,
        );
        expect(ChatMessage.deleteDocuments).toHaveBeenCalledWith(expectedDeleted);

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith(
          'mock-format[illandril-chat-enhancements.clear-chat.notification.deleted][{"count":"501"}]',
        );

        expect(warnSpy).toHaveBeenCalledTimes(3);
        expect(warnSpy).toHaveBeenCalledWith('Cleaning up Chat - confirmation disabled or skipped');
        expect(warnSpy).toHaveBeenCalledWith('Deleting', 501, 'messages');
        expect(warnSpy).toHaveBeenLastCalledWith('Deleted', 501, 'messages');
      });

      it('does not deletes messages on createChatMessage if not past trigger', async () => {
        Trigger.set(1000);
        Target.set(500);
        mockMessages.size = 1000;
        infoSpy.mockImplementation(() => 1234);
        warnSpy.mockImplementation(() => undefined);

        Hooks.callAll('createChatMessage', {} as foundry.abstract.Document, {}, {});
        await jest.runAllTimersAsync();

        expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
      });
    });
  });

  describe('Non-GM', () => {
    beforeEach(() => {
      CheckEveryMessage.set(true);
      Confirm.set(false);
      Trigger.set(1000);
      Target.set(500);
      (game.user as { isGM: boolean }).isGM = false;
      mockMessages.size = 10000;
    });

    it('does not try to delete any messages', async () => {
      Hooks.callAll('ready');
      await jest.runAllTimersAsync();

      expect(ChatMessage.deleteDocuments).not.toHaveBeenCalled();
    });
  });
});
