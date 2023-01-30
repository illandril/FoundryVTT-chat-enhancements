import { ModuleUtils } from '@illandril/foundryvtt-utils';
import module from './module';

it('is a Module instance', () => {
  expect(module).toBeInstanceOf(ModuleUtils);
});
