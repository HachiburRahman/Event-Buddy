import type { SelectQueryBuilder } from 'typeorm';
import type { Booking } from './entities/booking.entity';

// A booking row is written before Stripe is asked for a checkout page, so a row
// can exist for a payment that never happens: Stripe erroring, the user closing
// the tab, the card being abandoned at the form. Those rows sat at PENDING
// forever, and every seat query counted them, so each abandoned attempt shrank
// the event permanently. Production lost 10 of 250 seats on one event this way
// with no payment behind any of them.
//
// A PENDING booking therefore holds its seats only for a grace window. After
// that the seats return to the pool.
//
// The window is also passed to Stripe as the session's expires_at, so a session
// dies at the same moment we release its seats. Without that pairing a user
// could pay against an expired hold and oversell the event. 30 minutes is the
// shortest expiry Stripe accepts, so it is the floor for this value too.
export const PENDING_BOOKING_GRACE_MS = 30 * 60 * 1000;

export const seatHoldCutoff = (now: Date = new Date()): Date =>
  new Date(now.getTime() - PENDING_BOOKING_GRACE_MS);

/**
 * Narrows a booking query to the rows that still hold a seat.
 *
 * Anything not PENDING is settled and always counts. A PENDING row counts only
 * while it is inside the grace window, which is where a real user sits during
 * checkout.
 *
 * Every seat calculation must go through this. There are three of them — the
 * availability gate in BookingsService.create, the event list, and the event
 * detail page — and if they disagree the UI advertises seats that booking then
 * refuses, or hides seats that are actually free.
 */
export const whereHoldsASeat = <T extends SelectQueryBuilder<Booking>>(
  query: T,
  alias = 'booking',
  now: Date = new Date(),
): T => {
  query.andWhere(
    `(${alias}.paymentStatus != :pendingStatus OR ${alias}.createdAt > :seatHoldCutoff)`,
    { pendingStatus: 'PENDING', seatHoldCutoff: seatHoldCutoff(now) },
  );

  return query;
};
