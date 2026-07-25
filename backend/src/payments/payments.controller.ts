import { Controller, Post, Get, Query, Req, Headers, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';
import { BookingsService } from '../bookings/bookings.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Public()
  @Get('verify-session')
  @ApiOperation({ summary: 'Verify a Stripe checkout session and return payment details' })
  @ApiQuery({ name: 'session_id', required: true, description: 'Stripe Checkout Session ID' })
  async verifySession(@Query('session_id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('session_id query parameter is required');
    }
    return this.paymentsService.retrieveCheckoutSession(sessionId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook receiver' })
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body not available. Ensure rawBody is enabled in main.ts.');
    }

    const event = this.paymentsService.verifyWebhookEvent(rawBody, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const bookingId = session.metadata?.bookingId;
      const stripeSessionId = session.id;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      if (bookingId) {
        await this.bookingsService.completePayment(bookingId, stripeSessionId, amountPaid);
      }
    }

    return { received: true };
  }
}
