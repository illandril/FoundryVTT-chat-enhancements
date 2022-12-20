// Silence debug and info logging
jest.spyOn(console, 'debug').mockImplementation(() => undefined);
jest.spyOn(console, 'info').mockImplementation(() => undefined);
