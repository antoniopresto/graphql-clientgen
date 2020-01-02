const sh = require('shelljs');
const path = require('path');
const demoServer = require('./dev-server');

const bin = path.resolve(__dirname, '../build/main/lib/bin.js');
const dest = path.resolve(__dirname, '../examples');

demoServer((err, port) => {
  if (!process.env.ONLY_SERVER) {
    const cmd = `node ${bin} http://localhost:${port}/graphql ${dest}`;
    sh.exec(cmd, { silent: false, fatal: true, async: true });
  } else {
    console.log(`app running on http://localhost:${port}/graphql`);
  }
});
