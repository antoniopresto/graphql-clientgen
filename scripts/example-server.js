const sh = require('shelljs');
const path = require('path');
const demoServer = require('./dev-server');

const bin = path.resolve(__dirname, '../build/main/lib/bin.js');
const dest =  path.resolve(__dirname, '../examples');

demoServer((err, port) => {
  console.log({ err, port });

  const cmd = `node ${bin} http://localhost:${port}/graphql ${dest}`;

  console.log(`running "${cmd}"`);

  sh.exec(cmd, { silent: false, fatal: true, async: true });
});
