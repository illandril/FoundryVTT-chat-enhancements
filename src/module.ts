import { Module } from '@illandril/foundryvtt-utils';

declare global {
  const id: string;
  const title: string;
  const version: string;
  const bugs: string;
}
const module = new Module({ id, title, version, bugs });

export default module;
