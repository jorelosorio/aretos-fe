import {
  applyPostResult,
  postPendingNotes,
  saveThenPost,
  type PendingNote,
} from './pending-notes';

const note = (key: string, body = `body ${key}`): PendingNote => ({
  key,
  body,
  tags: [key],
  failed: false,
  error: null,
});

describe('postPendingNotes', () => {
  it('posts every note in order onto the log and reports them posted', async () => {
    const post = jest.fn().mockResolvedValue(undefined);

    const result = await postPendingNotes('l1', [note('a'), note('b')], post);

    expect(result).toEqual({ posted: ['a', 'b'], failed: null });
    expect(post.mock.calls).toEqual([
      ['l1', { body: 'body a', tags: ['a'] }],
      ['l1', { body: 'body b', tags: ['b'] }],
    ]);
  });

  it('stops at the first failure and reports which note failed and why', async () => {
    const refusal = new Error('limit');
    const post = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(refusal);

    const result = await postPendingNotes(
      'l1',
      [note('a'), note('b'), note('c')],
      post,
    );

    expect(post).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      posted: ['a'],
      failed: { key: 'b', error: refusal },
    });
  });

  it('does nothing with nothing pending', async () => {
    const post = jest.fn();

    expect(await postPendingNotes('l1', [], post)).toEqual({
      posted: [],
      failed: null,
    });
    expect(post).not.toHaveBeenCalled();
  });
});

describe('applyPostResult', () => {
  it('drops the posted notes and marks the failed one with its error', () => {
    const refusal = new Error('limit');

    const left = applyPostResult([note('a'), note('b'), note('c')], {
      posted: ['a'],
      failed: { key: 'b', error: refusal },
    });

    expect(left).toEqual([
      { ...note('b'), failed: true, error: refusal },
      note('c'),
    ]);
  });

  it('keeps a note added while the save was running', () => {
    const left = applyPostResult([note('a'), note('late')], {
      posted: ['a'],
      failed: null,
    });

    expect(left).toEqual([note('late')]);
  });

  it('keeps an edit made to a note that was not posted', () => {
    const left = applyPostResult([note('a'), note('b', 'edited')], {
      posted: ['a'],
      failed: null,
    });

    expect(left).toEqual([note('b', 'edited')]);
  });

  it('clears an earlier failure once that note posts', () => {
    const failed = { ...note('a'), failed: true, error: new Error('x') };

    expect(applyPostResult([failed], { posted: ['a'], failed: null })).toEqual(
      [],
    );
  });
});

describe('saveThenPost', () => {
  it('posts onto the log the save returned', async () => {
    const post = jest.fn().mockResolvedValue(undefined);

    await saveThenPost(async () => ({ id: 'fresh' }), [note('a')], post);

    expect(post).toHaveBeenCalledWith('fresh', {
      body: 'body a',
      tags: ['a'],
    });
  });

  it('does not post when the save itself fails', async () => {
    const post = jest.fn();

    await expect(
      saveThenPost(
        () => Promise.reject(new Error('refused')),
        [note('a')],
        post,
      ),
    ).rejects.toThrow('refused');
    expect(post).not.toHaveBeenCalled();
  });
});
