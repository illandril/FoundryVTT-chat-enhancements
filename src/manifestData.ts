import {
  version,
  bugs as bugsObj,
} from '../package.json';
import { id, title } from './manifestData.json';

const bugs = bugsObj.url;
export { id, title, version, bugs };

