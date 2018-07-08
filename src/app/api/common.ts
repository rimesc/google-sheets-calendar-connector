/**
 * Utilities for makng async API calls, with rate limiting and backoff.
 */

import { AxiosResponse } from 'axios';
import Bottleneck from "bottleneck"
import * as backoff from "backoff";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100
});

/** Equivalent to BodyResponseCallback<T>. */
type ResponseHandler<T> = (err: Error | null, res?: AxiosResponse<T> | null) => void;

function rateLimitExceeded(error: Error & {code: number, errors: {reason: string}[]}): boolean {
  return error.code == 403 && error.errors.some(err => err.reason === 'rateLimitExceeded')
}

/**
 * Makes an asynchronous call and handles the response.
 */
export function doCall<T>(call: (responseHandler: ResponseHandler<any>) => void) : Promise<T> {
  return limiter.schedule(c => callWithBackoff(c), call);
}

/**
 * Makes an asynchronous call with retry and back-off.
 */
function callWithBackoff<T>(call: (responseHandler: ResponseHandler<any>) => void) : Promise<T> {
  return new Promise<T>((resolve, reject) => {
    withBackoff(call, (err, response) => err ? reject(err) : resolve(response.data)).start();
  });
}

function withBackoff(call: (responseHandler: ResponseHandler<any>) => void, callback: (err, resp) => void): {start: () => void} {
  const backoffCall = backoff.call(call, callback);
  const strategy = new backoff.FibonacciStrategy({
    randomisationFactor: 0,
    initialDelay: 100,
    maxDelay: 1000,
  });
  backoffCall.setStrategy(strategy);
  backoffCall.retryIf(rateLimitExceeded);
  backoffCall.failAfter(10);
  return backoffCall;
}
