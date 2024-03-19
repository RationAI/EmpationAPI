/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";
import {ConnectionErrorEventArgs, RawAPI, sleep} from "../../src";

describe('http failure handling', () => {
    const pollyCtx = polly();

    let expectedRequestList: object[] = [];
    let desiredResponse = 200;
    function addExpectRequest(request) {
        expectedRequestList.push(request);
    }
    function getExpectingRequestsCount() {
        return expectedRequestList.length;
    }

    beforeEach(() => {
        pollyCtx.polly.server.any().intercept((req, res) => {
            const body = req.body ? JSON.parse(req.body) : {};
            const data = {
                body: body,
                url: req.url,
                headers: req.headers,
            };

            if (expectedRequestList.length > 0) {
                const requestData = expectedRequestList.shift();
                Object.keys(requestData!).every(key => {
                    expect(requestData![key]).toEqual(data[key]);
                    return true;
                });
            }

            res.json(data).status(desiredResponse);
        });
    });


    it('no errors', async () => {
        const errHandler = function(e: ConnectionErrorEventArgs) {
            throw "Error handler must not be called!";
        }
        const raw = new RawAPI("https://example.com", {
            errorHandler: errHandler,
            maxRetryCount: 10,
            nextRetryInMs: 500,
        });

        let res = await raw.http("some/endpoint", {});
        expect(res.body).toEqual({});
        res = await raw.http("other", {method: 'PUT', body: {
            some: "other data"
        }});
        expect(res.body.some).toEqual("other data");
        res = await raw.http("some/endpoint", {method: 'DELETE', query: {
            limit: 0,
            length: 50
        }, headers: {'Authorization': 'Bearer token'}});
        expect(res.url).toEqual("https://example.com/some/endpoint?limit=0&length=50");
    });

    it('simple network failure', async () => {
        const FAILED_RETRY_IN_MS = 500;

        const errHandler = function(e:ConnectionErrorEventArgs) {
            expect(e.retryCount).toBeLessThan(2);
        }
        const raw = new RawAPI("https://example.com", {
            errorHandler: errHandler,
            nextRetryInMs: FAILED_RETRY_IN_MS,
            maxRetryCount: 10,
        });

        let res = await raw.http("some/endpoint", {});
        expect(res.body).toEqual({});

        desiredResponse = 500;

        const body1 = {
            some: "other data"
        };
        await expect(raw.http("other", {
            method: 'PUT', body: body1
        })).rejects.toThrow('Internal Server Error');

        desiredResponse = 403;

        const body2 = {
            data: 3,
            bodyTest: body1
        };
        await expect(raw.http("other", {
            method: 'POST', body: body2
        })).rejects.toThrow('Forbidden');

        desiredResponse = 200;

        res = await raw.http("some/endpoint", {method: 'DELETE', query: {
                limit: 0,
                length: 50
            }, headers: {'Authorization': 'Bearer token'}});
        expect(res.headers.authorization).toBe('Bearer token');

        // After a while, requests are successfully replayed
        addExpectRequest({body: body1});
        addExpectRequest({body: body2});

        await sleep(FAILED_RETRY_IN_MS);

        expect(getExpectingRequestsCount()).toEqual(0);
    });
});
