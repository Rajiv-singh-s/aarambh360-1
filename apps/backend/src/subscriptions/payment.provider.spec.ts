import * as crypto from 'crypto';
import { RazorpayPaymentProvider } from './payment.provider';

describe('RazorpayPaymentProvider', () => {
  const webhookSecret = 'test-webhook-secret';
  let provider: RazorpayPaymentProvider;

  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
    provider = new RazorpayPaymentProvider();
  });

  afterEach(() => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  function sign(body: string): string {
    return crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  }

  it('accepts a valid signature for the exact raw payload', () => {
    const payload = '{"event":"subscription.charged","payload":{}}';
    const signature = sign(payload);
    expect(provider.verifyWebhookSignature(payload, signature)).toBe(true);
  });

  it('rejects an invalid signature', () => {
    const payload = '{"event":"subscription.charged","payload":{}}';
    expect(provider.verifyWebhookSignature(payload, 'invalid-signature')).toBe(false);
  });

  it('rejects a missing signature (empty string)', () => {
    const payload = '{"event":"subscription.charged","payload":{}}';
    expect(provider.verifyWebhookSignature(payload, '')).toBe(false);
  });

  it('rejects when the payload was modified after signing', () => {
    const original = '{"event":"subscription.charged","amount":100}';
    const tampered = '{"event":"subscription.charged","amount":999}';
    const signature = sign(original);
    expect(provider.verifyWebhookSignature(tampered, signature)).toBe(false);
  });

  it('rejects when webhook secret is not configured', () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const unconfigured = new RazorpayPaymentProvider();
    const payload = '{"event":"subscription.charged"}';
    expect(unconfigured.verifyWebhookSignature(payload, sign(payload))).toBe(false);
  });
});
