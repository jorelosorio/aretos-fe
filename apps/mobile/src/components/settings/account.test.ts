import { planLabelKey } from './account';

describe('planLabelKey', () => {
  it('names the plans the server has', () => {
    expect(planLabelKey('free')).toBe('account.plan.free');
    expect(planLabelKey('plus')).toBe('account.plan.plus');
  });

  it('has no name yet for a plan added on the server later', () => {
    expect(planLabelKey('team')).toBeNull();
  });
});
