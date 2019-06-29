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

main().catch(console.error);

async function main() {
  await fs.copy(CWD + '/src/template', CWD + '/build/template');
}
