const puppeteer = require('puppeteer');
// const asyncTimeout = require('await-timeout');

const fnGetActual = async function (browser, page, get_actual) {
    if (get_actual === 'getCurrentTabUrl') {
        return page._target._targetInfo.url;
    } else {
        // TODO: Handle unexpected situation gracefully or provide detailed information to the user
        throw new Error(`The given "get_actual" (${get_actual}) is not handled yet`);
    }
};

const performStep = async function (browser, page, step) {
    if (!step.type) {
        step.type = 'action';
    }

    if (step.type === 'action') {
        const
            action = step.action,
            payload = step.payload;
        if (action === 'newBrowserContext') {
            // TODO: Pending
        } else if (action === 'openNewTab') {
            const newPage = await browser.newPage();
            return newPage;
        } else if (action === 'goToUrl') {
            const url = payload;
            await page.goto(url);
        } else {
            // TODO: Handle unexpected situation gracefully or provide detailed information to the user
            throw new Error('The given "step" (of type "action") is not handled yet');
        }
    } else if (step.type === 'assert') {
        // TODO: Pending
        const assertion = step.assertion;
        const expected = step.expected;

        let actual = undefined;
        if (step.get_actual) {
            actual = await fnGetActual(browser, page, step.get_actual.type);
        }
        if (assertion === 'assertEqual') {
            if (expected === actual) {
                // do nothing
            } else {
                console.log('Step: ', step);
                console.log('Expected: ', expected);
                console.log('Actual: ', actual);
                throw new Error('Assertion failed');
            }
        } else {
            // TODO: Handle unexpected situation gracefully or provide detailed information to the user
            throw new Error('The given "step" (of type "assertion") is not handled yet');
        }
    } else if (step.type === 'read') {
        // await asyncTimeout.set(5000);
        await page.waitForSelector(step.selector);
        const elementHandle = await page.$(step.selector);
        if (step.readProperty === 'innerText') {
            const innerText = await page.evaluate(function (element) {
                if (element) {
                    return element.innerText;
                } else {
                    return null;
                }
            }, elementHandle);

            if (step.custom) {
                step.custom(innerText);
            } else {
                console.log(innerText);
            }
        } else {
            throw new Error('This functionality is not available yet');
        }
    }
    return page;
};

let page = undefined;

const performSteps = async function (browser, steps) {
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (typeof step === 'function') {
            step();
        } else {
            page = await performStep(browser, page, step); // eslint-disable-line require-atomic-updates
        }
    }
};

const getBrowserAsync = async function (options) {
    options = options || {};
    const browser = await puppeteer.launch(options);
    return browser;
};

module.exports = {
    getBrowserAsync,
    performSteps
};
