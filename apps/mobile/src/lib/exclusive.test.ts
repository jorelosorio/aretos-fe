import { runExclusive } from './exclusive';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('runExclusive', () => {
  it('ignores a second call while the first is still running', async () => {
    const lock = { current: false };
    const gate = deferred();
    const task = jest.fn(() => gate.promise.then(() => 'done'));

    const first = runExclusive(lock, task);
    const second = runExclusive(lock, task);

    expect(await second).toBeUndefined();
    gate.resolve();
    expect(await first).toBe('done');
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('runs again once the first call has finished', async () => {
    const lock = { current: false };
    const task = jest.fn().mockResolvedValue('ok');

    await runExclusive(lock, task);
    await runExclusive(lock, task);

    expect(task).toHaveBeenCalledTimes(2);
  });

  it('releases the lock when the task fails, and rethrows', async () => {
    const lock = { current: false };

    await expect(
      runExclusive(lock, () => Promise.reject(new Error('refused'))),
    ).rejects.toThrow('refused');
    expect(lock.current).toBe(false);
  });
});
