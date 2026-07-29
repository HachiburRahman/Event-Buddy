import { PENDING_BOOKING_GRACE_MS, seatHoldCutoff, whereHoldsASeat } from './booking-seats';

describe('seatHoldCutoff', () => {
  it('sits exactly one grace window behind the given time', () => {
    const now = new Date('2026-07-29T12:00:00.000Z');
    expect(seatHoldCutoff(now).toISOString()).toBe('2026-07-29T11:30:00.000Z');
  });

  // Stripe refuses a session expiry under 30 minutes, and the session must die
  // when the hold does or a late payment can oversell the event.
  it('is at least the 30 minutes Stripe allows for expires_at', () => {
    expect(PENDING_BOOKING_GRACE_MS).toBeGreaterThanOrEqual(30 * 60 * 1000);
  });
});

describe('whereHoldsASeat', () => {
  // Only the andWhere contract matters here, so a recording stub is enough to
  // pin the SQL and its parameters without a database.
  const fakeQuery = () => {
    const calls: Array<{ clause: string; params: Record<string, unknown> }> = [];
    const query = {
      calls,
      andWhere(clause: string, params: Record<string, unknown>) {
        calls.push({ clause, params });
        return this;
      },
    };
    return query as unknown as Parameters<typeof whereHoldsASeat>[0] & typeof query;
  };

  it('returns the same query so it can wrap a builder inline', () => {
    const query = fakeQuery();
    expect(whereHoldsASeat(query)).toBe(query);
  });

  it('adds the clause with andWhere, never clobbering an existing where', () => {
    const query = fakeQuery();
    whereHoldsASeat(query);
    expect(query.calls).toHaveLength(1);
  });

  // The bug: every seat query counted PENDING rows forever, so an abandoned
  // checkout shrank the event permanently. Production lost 10 of 250 seats.
  it('keeps settled bookings and time-limits PENDING ones', () => {
    const query = fakeQuery();
    whereHoldsASeat(query);
    const { clause, params } = query.calls[0];

    expect(clause).toContain('paymentStatus != :pendingStatus');
    expect(clause).toContain('createdAt > :seatHoldCutoff');
    expect(clause).toContain('OR');
    expect(params.pendingStatus).toBe('PENDING');
  });

  it('passes a cutoff one grace window behind the supplied clock', () => {
    const query = fakeQuery();
    const now = new Date('2026-07-29T12:00:00.000Z');
    whereHoldsASeat(query, 'booking', now);

    expect(query.calls[0].params.seatHoldCutoff).toEqual(new Date('2026-07-29T11:30:00.000Z'));
  });

  it('honours a custom alias so it composes with any builder', () => {
    const query = fakeQuery();
    whereHoldsASeat(query, 'b');
    expect(query.calls[0].clause).toContain('b.paymentStatus');
    expect(query.calls[0].clause).toContain('b.createdAt');
  });

  // The clause is ORed internally, so it must be parenthesised or an outer
  // AND would bind to only the first half and let PENDING rows back in.
  it('wraps itself in parentheses so it cannot break an outer AND', () => {
    const query = fakeQuery();
    whereHoldsASeat(query);
    expect(query.calls[0].clause.trim().startsWith('(')).toBe(true);
    expect(query.calls[0].clause.trim().endsWith(')')).toBe(true);
  });
});
