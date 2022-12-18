import { Module } from '@illandril/foundryvtt-utils';
import { id, title, version, bugs } from './manifestData';

const module = new Module({ id, title, version, bugs });

export default module;
