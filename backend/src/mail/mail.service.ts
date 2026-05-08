import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingConfirmation(
    email: string,
    userName: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    numberOfSeats: number,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #4a90a4; margin: 0; }
              .content { background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
              .details { margin: 20px 0; }
              .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; width: 150px; color: #666; }
              .detail-value { flex: 1; color: #333; }
              .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
              .button { display: inline-block; padding: 12px 30px; background-color: #4a90a4; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🎉 Booking Confirmed!</h1>
              </div>
              <div class="content">
                  <p>Hi ${userName},</p>
                  <p>Great news! Your booking has been confirmed. Here are your event details:</p>
                  <div class="details">
                      <div class="detail-row"><div class="detail-label">Event:</div><div class="detail-value">${eventTitle}</div></div>
                      <div class="detail-row"><div class="detail-label">Date & Time:</div><div class="detail-value">${eventDate.toLocaleString()}</div></div>
                      <div class="detail-row"><div class="detail-label">Location:</div><div class="detail-value">${eventLocation}</div></div>
                      <div class="detail-row"><div class="detail-label">Number of Seats:</div><div class="detail-value">${numberOfSeats}</div></div>
                  </div>
                  <p style="text-align: center;"><a href="http://localhost:3001/my-bookings" class="button">View My Bookings</a></p>
                  <p>Please arrive at least 15 minutes before the event starts. Don't forget to bring your confirmation email!</p>
              </div>
              <div class="footer">
                  <p>This is an automated message from Event Buddy.</p>
                  <p>If you didn't make this booking, please contact us immediately.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: `Booking Confirmation - ${eventTitle}`,
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    userName: string,
    resetCode: string,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #4a90a4; margin: 0; }
              .content { background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
              .code-box { background-color: #f0f7fa; border: 2px dashed #4a90a4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
              .code { font-size: 32px; font-weight: bold; color: #4a90a4; letter-spacing: 5px; font-family: 'Courier New', monospace; }
              .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                  <p>Hi ${userName},</p>
                  <p>We received a request to reset your password. Use the verification code below to reset your password:</p>
                  <div class="code-box">
                      <div class="code">${resetCode}</div>
                  </div>
                  <p><strong>This code will expire in 15 minutes.</strong></p>
                  <div class="warning">
                      <strong>⚠️ Security Notice:</strong>
                      <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                          <li>Never share this code with anyone</li>
                          <li>Our team will never ask for your code</li>
                          <li>If you didn't request this, ignore this email</li>
                      </ul>
                  </div>
                  <p>If you're having trouble, contact us at <a href="mailto:support@eventbuddy.com">support@eventbuddy.com</a></p>
              </div>
              <div class="footer">
                  <p>This is an automated message from Event Buddy.</p>
                  <p>If you didn't request a password reset, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request - Event Buddy',
      html,
    });
  }
}
