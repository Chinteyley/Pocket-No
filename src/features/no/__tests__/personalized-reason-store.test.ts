import { createNoReason } from '../catalog';
import {
  clearPersonalizedNoReason,
  getPersonalizedNoReasonSnapshot,
  setPersonalizedNoReason,
  subscribeToPersonalizedNoReason,
} from '../personalized-reason-store';

describe('personalized reason store', () => {
  afterEach(() => {
    clearPersonalizedNoReason();
  });

  it('publishes personalized reasons to subscribers', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToPersonalizedNoReason(listener);

    setPersonalizedNoReason(
      createNoReason({
        id: 'apple-personalized-1',
        text: 'I cannot add that without betraying the version of me that needs a night off.',
        source: 'apple-personalized',
      })
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getPersonalizedNoReasonSnapshot()?.source).toBe('apple-personalized');

    unsubscribe();
  });

  it('clears the personalized reason snapshot', () => {
    setPersonalizedNoReason(
      createNoReason({
        id: 'apple-personalized-2',
        text: 'That is a no from the version of me trying to stay sane this week.',
        source: 'apple-personalized',
      })
    );

    clearPersonalizedNoReason();

    expect(getPersonalizedNoReasonSnapshot()).toBeNull();
  });
});
