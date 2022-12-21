import { Module } from '@illandril/foundryvtt-utils';

declare global {
  const moduleMetadata: {
    readonly id: string
    readonly title: string
    readonly version: string
    readonly bugs: string
  };
}
const module = new Module(moduleMetadata);

export default module;
