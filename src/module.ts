import { ModuleUtils } from '@illandril/foundryvtt-utils';

declare global {
  const moduleMetadata: {
    readonly id: 'illandril-chat-enhancements'
    readonly title: string
    readonly version: string
    readonly bugs: string
  };
}
const module = new ModuleUtils(moduleMetadata);

export default module;
