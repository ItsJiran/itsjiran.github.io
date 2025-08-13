/**
 * Runs an array of Promises sequentially.
 * Each promise will only start after the previous one has resolved.
 * @param {Array<Promise<any>>} promises - An array of Promises to execute.
 * @returns {Promise<Array<any>>} A Promise that resolves with an array of results from all promises.
 */
export function runPromisesSequentially(promises) {
  return promises.reduce((chain, currentPromise) => {
    return chain.then(() => currentPromise);
  }, Promise.resolve()); // Start with an already resolved promise
}

/**
 * Runs an array of Promises concurrently.
 * All promises will start at roughly the same time.
 * @param {Array<Promise<any>>} promises - An array of Promises to execute.
 * @returns {Promise<Array<any>>} A Promise that resolves with an array of results from all promises.
 */
export function runPromisesConcurrently(promises) {
  return Promise.all(promises);
}
