import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

failOnConsole({
  shouldFailOnAssert: true,
  shouldFailOnError: true,
  shouldFailOnWarn: true,
  shouldFailOnLog: true,
});
