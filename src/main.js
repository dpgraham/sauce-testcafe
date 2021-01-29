const webdriverio = require('webdriverio');
const { SubProcess } = require('teen_process');
const path = require('path');
const B = require('bluebird');

async function main () {
  let connectUrl;
  let session;
  let isSessionDone = false;
  try {
    // Start TestCafe remote, and wait for it to log out the connectUrl
    function startTestCafe () {
      return new Promise((resolve, reject) => {
        try {
          const testcafeBinary = process.platform == 'win32' ? 'testcafe.cmd' : 'testcafe';
          const bundledTestCafePath = path.join(__dirname, '..', 'node_modules', '.bin', testcafeBinary);
          const testCafePath = bundledTestCafePath; // Add flag that lets user point to binary on their machine
          const testCafeArgs = process.argv.slice(2); // Change this to 1 when it's a binary
          const testCafeProc = new SubProcess(testCafePath, ['remote', ...testCafeArgs]);
          testCafeProc.start(); // TODO: Add a check for testCafe being ready
          testCafeProc.on('lines-stdout', (lines) => {
            for (let line of lines) {
              if (line.toLowerCase().startsWith('connect url')) {
                const tokens = line.split(':');
                connectUrl = tokens.slice(1).join(':').trim();
                //connectUrl = new URL(tokens.slice(1).join(':').trim());
                //connectUrl = `${connectUrl.protocol}localhost:${connectUrl.port}${connectUrl.pathname}`
                resolve(testCafeProc);
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
            if (code !== 0) {
              reject();
            }
            // TODO: Report the status
          });
        } catch (e) {
          reject();
        }
      });
    }
    const testCafeProc = await startTestCafe();

    // Get a unique build name
    function getBuildName () {
      if (process.env.SAUCE_BUILD) {
        return process.env.SAUCE_BUILD;
      }
      if (process.env.GITHUB_RUN_ID) {
        return `github-${process.env.GITHUB_RUN_ID}`;
      }
      return 
    }
    const buildName = getBuildName();

    // Function that gives a Sauce Labs Test Name (for display purposes)
    function getTestName () {
      if (process.env.SAUCE_TEST_NAME) {
        return process.env.SAUCE_TEST_NAME;
      }
      const nameTokens = [
        process.env.SAUCE_BROWSER_NAME,
        process.env.SAUCE_BROWSER_VERSION,
        process.env.SAUCE_PLATFORM_NAME,
        process.env.SAUCE_PLATFORM_VERSION,
        process.env.SAUCE_DEVICE_NAME,
      ];
      const usedTokens = [];
      for (const token of nameTokens) {
        if (token) {
          usedTokens.push(token);
        }
      }
      return usedTokens.join(' -- ');
    }
    const testName = getTestName();

    // Get the browser name
    function getBrowserName () {
      if (process.env.SAUCE_BROWSER_NAME) {
        return process.env.SAUCE_BROWSER_NAME;
      }
      const platformName = process.env.SAUCE_PLATFORM_NAME || '';
      if (platformName.toLowerCase() === 'ios') {
        return 'Safari';
      }
      return 'Chrome';
    }

    // Start Sauce Labs session and give it the testCafe connect URL
    async function startSauceLabsSession () {
      const capabilities = {
        browserName: getBrowserName(),
        browserVersion: process.env.SAUCE_BROWSER_VERSION || 'latest',
        platformName: process.env.SAUCE_PLATFORM_NAME || 'windows',
        'sauce:options': {
          build: buildName,
          name: testName,
          'tunnel-identifier': process.env.SAUCE_TUNNEL_ID,
        }
      };
      if (process.env.SAUCE_PLATFORM_VERSION) {
        capabilities.platformVersion = process.env.SAUCE_PLATFORM_VERSION;
      }
      if (process.env.SAUCE_DEVICE_NAME) {
        capabilities.deviceName = process.env.SAUCE_DEVICE_NAME;
        capabilities['appium:deviceName'] = process.env.SAUCE_DEVICE_NAME;
        capabilities.name = testName;
        capabilities.tunnelIdentifier = process.env.SAUCE_TUNNEL_ID;
      }
      session = await webdriverio.remote({
          port: 80,
          protocol: 'http',
          region: process.env.SAUCE_REGION || 'us',
          user: process.env.SAUCE_USERNAME,
          key: process.env.SAUCE_ACCESS_KEY,
          capabilities,
      });
      await session.url(connectUrl);
      return session;
    }
    session = await startSauceLabsSession();

    // Ping session every 10 seconds so that it
    // does not time out in middle of TestCafe run
    async function pingSession () {
      if (!isSessionDone) {
        await B.delay(10 * 6000);
        await session.getSession();
        pingSession();
      }
    };
    pingSession();

    // Wait for the testCafe session to complete
    function waitForTestCafe () {
      return new Promise((resolve, reject) => {
        testCafeProc.on('exit', (code) => {
          code === 0 ? resolve() : reject();
        });
      });
    }
    await waitForTestCafe();
    console.log('Running test on Sauce Cloud'); // TODO: Winstonize this
  } catch (e) {
    console.log(e);
    process.exit(1);
  } finally {
    if (session) {
      await session.deleteSession();
      console.log('Session closed');
    }
  }
};

main()
  .catch((reason) => {
    console.error(reason);
    process.exit(1);
  })
  .then(() => process.exit(0));


