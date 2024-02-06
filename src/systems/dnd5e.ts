
declare global {
  interface HookCallbacks {
    'dnd5e.renderChatMessage': (message: ChatMessage, element: HTMLElement) => void
  }
}

export const is5e3OrNewer = () => game.system.id === 'dnd5e' && !foundry.utils.isNewerVersion('3.0.0', game.system.version);
