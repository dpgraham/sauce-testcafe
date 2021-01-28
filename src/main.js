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
        const testCafeProc = new SubProcess(testCafePath, ['remote', ...testCafeArgs]);
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
            console.log(stdout.trim());
          }
          if (stderr) {
            console.error(stderr.trim());
          }
        });
        testCafeProc.on('exit', (code) => {
          session.deleteSession();
          if (code !== 0) {
            reject();
          }
          session.set;
          // TODO: Report the status
        });
        return testCafeProc;
      });
    }
    await startTestCafe();

    // TODO: Add command line flags that pull this in
    const capabilities = {
      browserName: process.env.SAUCE_BROWSER_NAME || 'Chrome',
      browserVersion: process.env.SAUCE_BROWSER_VERSION || 'latest',
      platformName: process.env.SAUCE_PLATFORM_NAME || 'windows',
      'sauce:options': {
        build: process.env.SAUCE_BUILD,
        name: 'Test Name', // TODO: Parameterize this; make a sensible default
      }
    };
    if (process.env.SAUCE_PLATFORM_VERSION) {
      capabilities.platformVersion = process.env.SAUCE_PLATFORM_VERSION;
    }
    if (process.env.SAUCE_DEVICE_NAME) {
      capabilities.deviceName = process.env.SAUCE_DEVICE_NAME;
    }
    session = await webdriverio.remote({
        port: 80,
        protocol: 'http',
        region: process.env.SAUCE_REGION || 'us',
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        capabilities,
    });
    session.url(connectUrl);
    console.log('Running test on Sauce Cloud'); // TODO: Winstonize this
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

main();


