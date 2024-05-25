import module from './module';

const cssPrefix = module.cssPrefix.childPrefix('clear-chat');
const confirmMessage = cssPrefix.child('confirm-message');

export const Enabled = module.settings.register('clear-chat.enabled', Boolean, false, {
  hasHint: true,
});

export const Confirm = module.settings.register('clear-chat.confirm', Boolean, true, {
  hasHint: true,
});

export const Trigger = module.settings.register('clear-chat.trigger', Number, 1000, {
  hasHint: true,
});

export const Target = module.settings.register('clear-chat.target', Number, 500, {
  hasHint: true,
});

Hooks.on('ready', () => {
  if (!game.user?.isGM) {
    return;
  }
  if (!Enabled.get()) {
    module.logger.debug('clear-chat disabled');
    return;
  }
  const target = Target.get();
  if (target < 0) {
    module.logger.error('Chat Log not cleared - Clear Target cannot be negative', target);
    return;
  }
  const trigger = Trigger.get();
  if (trigger < target) {
    module.logger.error('Chat Log not cleared - Clear Trigger cannot be less than the Clear Target', trigger, target);
    return;
  }
  module.logger.debug('clear-chat enabled', trigger, target);
  sweepChatLog(trigger, target);
});

const sweepChatLog = (trigger: number, target: number) => {
  if (game.messages.size <= trigger) {
    module.logger.debug(
      'Chat Log not cleared - fewer (or equal) messages than the trigger',
      game.messages.size,
      trigger,
    );
    return;
  }

  const toDelete = getMessagesToDelete(target);
  module.logger.info('Deleting', toDelete.length, 'of', game.messages.size, 'messages', toDelete);

  const cleanup = async () => {
    module.logger.warn('Deleting', toDelete.length, 'messages');
    await ChatMessage.deleteDocuments(toDelete);
    module.logger.warn('Deleted', toDelete.length, 'messages');
    ui.notifications.info(
      module.localize('clear-chat.notification.deleted', {
        count: toDelete.length.toString(),
      }),
    );
  };

  if (!Confirm.get()) {
    module.logger.warn('Cleaning up Chat - confirmation disabled');
    void cleanup();
    return;
  }
  cleanupOnConfirm(trigger, target, toDelete, cleanup);
};

const getMessagesToDelete = (target: number) => {
  const deleteCount = game.messages.size - target;
  return game.messages.reduce((acc, message, i) => {
    if (i < deleteCount) {
      acc.push(message.id);
    }
    return acc;
  }, [] as string[]);
};

const cleanupOnConfirm = (trigger: number, target: number, toDelete: string[], cleanup: () => Promise<void>) => {
  const message = document.createElement('div');
  message.appendChild(
    document.createTextNode(
      module.localize('clear-chat.confirm.message', {
        count: toDelete.length.toString(),
        total: game.messages.size.toString(),
        trigger: trigger.toString(),
        target: target.toString(),
      }),
    ),
  );
  message.classList.add(confirmMessage);

  void Dialog.confirm({
    title: module.localize('clear-chat.confirm.title'),
    content: message.outerHTML,
    yes: () => {
      module.logger.warn('Cleaning up Chat - cleanup confirmed');
      void cleanup();
    },
    no: () => {
      module.logger.warn('Not cleaning up Chat - cleanup not confirmed');
    },
    defaultYes: false,
  });
};
