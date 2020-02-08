#!/usr/bin/env node

const meow = require('meow');
const fs = require('fs-extra');

const CWD = process.cwd();

const cli = meow(
  `
Usage: 
  $ ...
    
  Options:
    --
`,
  {
    flags: {
      env: {
        type: 'string',
        default: 'dev'
      }
    }
  }
);

const dest = CWD + '/build/client';

fs.ensureDirSync(dest);
fs.copySync(CWD + '/src/client', dest);
