# Sauce Test Cafe

Run your TestCafe tests on the Sauce Labs cloud! Run your tests on Chrome, Firefox, Edge, iOS Simulators, Android Emulators and even iOS and Android real devices. 

## Getting Started

* Install using npm `npm install -g sauce-testcafe`
* Get a Sauce Labs account (if you don't have one already) https://saucelabs.com/sign-up
* Set the environment variables `SAUCE_USERNAME` to your Sauce Labs username and `SAUCE_ACCESS_KEY` to your Sauce Labs access key (https://app.saucelabs.com/user-settings) (keep these variables secret, do not commit them to your repository)
* Take your existing testcafe test, and run it the same way, except using `sauce-testcafe`
  * e.g.) Change `testcafe ./path/to/test.js` to `sauce-testcafe ./path/to/test.js`
* View your TestCafe test at the Sauce Labs dashboard at https://app.saucelabs.com/dashboard/tests/vdc

## Usage

The "Getting Started" example runs your test using the default capabilities (Google Chrome on Windows). To run your tests on different browsers and platforms, you need to provide environment variables to your test

| Environment Variable | Description | Example | Default |
| ---- | ---- | ---- |
| SAUCE_BROWSER_NAME | The name of the browser to run on | Chrome, Safari, MicrosoftEdge | Chrome |
| SAUCE_BROWSER_VERSION | The version of the browser | (see platform configurator https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/) | latest |
| SAUCE_PLATFORM_NAME | The platform to run on | Windows, Windows 10, macOS 10.15, iOS, Android | Windows |
| SAUCE_PLATFORM_VERSION | The version of the platform (only applies to iOS and Android) | 14.0, 13.4 (iOS) 8.0, 8.1, 9.0 (Android) | <empty> |
| SAUCE_DEVICE_NAME | The name of the device (only applies to iOS and Android) | iPhone Simulator, Android Emulator, iPhone X Simulator, iPad Simulator (see platform configurator https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/) | <empty> |
| SAUCE_BUILD | The name of the Sauce build to group tests together | "My Saucy Build" | <empty> |
| SAUCE_REGION | The region to run the SauceLabs tests | "us", "eu" | "us" |
