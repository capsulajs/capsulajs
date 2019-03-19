import '@capsulajs/containers/src/index';
import ContainersPOC from './ContainersPOC.test';

mocha.setup({
   bail: true, // abort after first test fail
   ignoreLeaks: true,
   timeout: 60000,
   ui: 'bdd',
});

ContainersPOC();

mocha.run();

