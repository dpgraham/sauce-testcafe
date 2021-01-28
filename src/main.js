const webdriverio = require('webdriverio');
const { SubProcess } = require('teen_process');
const path = require('path');

async function main () {
  try {
    // TODO: Add SauceConnect handling logic
    /*function startSauceConnect () {
      return new Promise((resolve, reject) => {
        const sauceConnectProc = await new SubProcess(`npx`, ['sl', 'sc']); // TODO: Add a tunnel identifier here
        sauceConnectProc.on('output', (stdout, stderr) => {
            console.log(`SAUCE-CONNECT: ${stdout}`); // TODO: Use winston logs here
            console.error(`SAUCE-CONNECT: ${stderr}`);
        });
        sauceConnectProc.start(); // TODO: Check the sauceconnect logs to verify it's ready
      });
    }
    await startSauceConnect();*/

    let connectUrl;
    let session;
    function startTestCafe () {
      return new Promise((resolve, reject) => {
        const bundledTestCafePath = path.join(__dirname, '..', 'node_modules', '.bin', 'testcafe');
        const testCafePath = bundledTestCafePath; // Add flag that lets user point to binary on their machine
        const testCafeArgs = process.argv.slice(2); // Change this to 1 when it's a binary
        const remotePort = 4444; // TODO: Use some type of portfinder
        const testCafeProc = new SubProcess(testCafePath, ['remote', ...testCafeArgs, '--port', remotePort]);
        testCafeProc.start(); // TODO: Add a check for testCafe being ready
        testCafeProc.on('lines-stdout', (lines) => {
          for (let line of lines) {
            if (line.toLowerCase().startsWith('connect url')) {
              const tokens = line.split(':');
              connectUrl = tokens.slice(1).join(':').trim();;
              resolve();
            }
          }
        });
        testCafeProc.on('output', (stdout, stderr) => {
          if (stdout) {
            console.log(stdout);
          }
          if (stderr) {
            console.error(stderr);
          }
        });
        testCafeProc.on('exit', (code) => {
          session.deleteSession();
          if (code !== 0) {
            reject();
          }
        });
        return testCafeProc;
      });
    }
    await startTestCafe();

    const capabilities = {
        browserName: 'Safari',
        //browserVersion: '13.1',
        appiumVersion: '1.19.2',
        platformName: 'iOS',
        platformVersion: '13.4',
        deviceName: 'iPhone Simulator',
        //'sauce:options': {}
    };
    session = await webdriverio.remote({
        port: 80,
        protocol: 'http',
        region: 'us', // TODO: Parameterize this
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        capabilities,
    });
    session.url(connectUrl);
  } catch (e) {
    console.log(e);
  }
};

main();


