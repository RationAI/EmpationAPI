/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";
import {ConnectionErrorEventArgs, RawAPI} from "../../src";

describe('http failure handling', () => {
    const pollyCtx = polly();

    let desiredResponse = 200;

    beforeEach(() => {
        pollyCtx.polly.server.any().intercept((req, res) => {
            res.status(desiredResponse).json({
                test: "data"
            })
        });
    });


    it('no errors', async () => {
        const errHandler = function(e:ConnectionErrorEventArgs) {
            throw "Error handler must not be called!";
        }
        const raw = new RawAPI("https://example.com", errHandler);

        let res = await raw.http("some/endpoint", {});
        expect(res?.test).toBe("data");
        res = await raw.http("other", {method: 'PUT', body: {
            some: "other data"
        }});
        expect(res?.test).toBe("data");
        res = await raw.http("some/endpoint", {method: 'DELETE', query: {
            limit: 0,
            length: 50
        }, headers: {'Authorization': 'Bearer token'}});
        expect(res?.test).toBe("data");
    });

    it('simple network failure', async () => {
        const errHandler = function(e:ConnectionErrorEventArgs) {
            //todo
        }
        const raw = new RawAPI("https://example.com", errHandler);

        let res = await raw.http("some/endpoint", {});
        expect(res?.test).toBe("data");

        desiredResponse = 500;

        await expect(raw.http("other", {
            method: 'PUT', body: {
                some: "other data"
            }
        })).rejects.toThrow('Internal Server Error');

        expect(res?.test).toBe("data");
        res = await raw.http("some/endpoint", {method: 'DELETE', query: {
                limit: 0,
                length: 50
            }, headers: {'Authorization': 'Bearer token'}});
        expect(res?.test).toBe("data");
    });
});
