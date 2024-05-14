import path from 'path';
import { setupPolly } from 'setup-polly-jest';
import { Polly, PollyConfig } from '@pollyjs/core';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FSPersister from '@pollyjs/persister-fs';
import FetchAdapter from '@pollyjs/adapter-fetch';

export function polly() {
  let recordIfMissing = true;
  let mode: PollyConfig['mode'] = 'record';

  // switch (process.env.POLLY_MODE) {
  //     case 'record':
  //         mode = 'record';
  //         break;
  //     case 'replay':
  //         mode = 'replay';
  //         break;
  //     case 'offline':
  //         mode = 'replay';
  //         recordIfMissing = false;
  //         break;
  // }

  return setupPolly({
    //fetch is implemented by node-http for npm prior v18
    adapters: [NodeHttpAdapter, FetchAdapter],
    mode,
    recordIfMissing,
    flushRequestsOnStop: true,
    recordFailedRequests: true,
    persister: FSPersister,
    persisterOptions: {
      fs: {
        recordingsDir: path.resolve(__dirname, '__recordings__'),
      },
    },
    logLevel: 'silent',
  });
}
