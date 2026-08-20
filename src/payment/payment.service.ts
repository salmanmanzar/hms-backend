import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }

    async createPaymentIntent(feeInRupees: number) {
        const amount = Math.round(feeInRupees * 100);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'pkr',
            automatic_payment_methods: { enabled: true },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: amount / 100,
        };
    }

    async verifyPayment(paymentIntentId: string): Promise<boolean> {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    }

    async refundPayment(paymentIntentId: string): Promise<void> {
        try {
            await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
        } catch (error) {
            console.error(`CRITICAL: Failed to refund payment ${paymentIntentId}`, error);
        }
    }
}