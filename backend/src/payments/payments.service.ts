import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { requireStripeSecretKey } from '../config/stripe.config';
import { PENDING_BOOKING_GRACE_MS } from '../bookings/booking-seats';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(requireStripeSecretKey(this.configService), {});
  }

  async createCheckoutSession(
    bookingId: string,
    eventTitle: string,
    price: number,
    quantity: number,
  ): Promise<string> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const unitAmount = Math.round(price * 100); // Stripe requires amount in cents

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: eventTitle,
                description: `Ticket booking for event: ${eventTitle}`,
              },
              unit_amount: unitAmount,
            },
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: `${frontendUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/booking/cancel?booking_id=${bookingId}`,
        // The seats behind this booking are released once the grace window
        // passes, so the session has to die at the same moment. Stripe's default
        // is 24 hours, which would let someone pay long after their hold was
        // handed to another buyer and oversell the event.
        expires_at: Math.floor((Date.now() + PENDING_BOOKING_GRACE_MS) / 1000),
        metadata: {
          bookingId: bookingId,
        },
      });

      return session.url || '';
    } catch (error: any) {
      console.error('Failed to create Stripe session:', error);
      throw new BadRequestException(`Stripe Checkout Session initialization failed: ${error.message}`);
    }
  }

  async retrieveCheckoutSession(sessionId: string): Promise<{
    paymentStatus: string;
    amountTotal: number;
    currency: string;
    bookingId: string | null;
    customerEmail: string | null;
    eventName: string | null;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
      });

      return {
        paymentStatus: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'usd',
        bookingId: session.metadata?.bookingId || null,
        customerEmail: session.customer_details?.email || null,
        eventName: session.line_items?.data?.[0]?.description || null,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to retrieve Stripe session: ${error.message}`);
    }
  }

  verifyWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured on the server.');
    }
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      throw new BadRequestException(`Stripe Webhook Signature Verification failed: ${error.message}`);
    }
  }
}
