import Decimal from "decimal.js";
import {FundDetails} from "../../domain/payment/payment";
import Stripe from "stripe";
import {PaymentRepository} from "../../domain/payment/repository";
import {Environment} from "../../../package/configs/environment";
import {BadRequestError} from "../../../package/errors/customError";


class StripeClass implements PaymentRepository {
    stripeClient: Stripe
    environmentVariable: Environment

    constructor(stripeClient: Stripe, environmentVariable: Environment) {
        this.stripeClient = stripeClient;
        this.environmentVariable = environmentVariable
    }

    async fund(amount: string): Promise<FundDetails> {
        try {
            const session = await this.stripeClient.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Activation Fee',
                            },
                            unit_amount: (new Decimal(amount).toDecimalPlaces(2).mul(100).toNumber()),
                        },
                        quantity: 1,
                    },
                ],
                success_url: this.environmentVariable.stripeCredential.successURL,
                cancel_url: this.environmentVariable.stripeCredential.cancelURL,
            });

            if (!session.url) {
                throw new BadRequestError("failed to process transaction")
            }

            return {
                checkoutUrl: session.url,
                reference: session.id,
            };
        } catch (error) {
            throw error;
        }
    }


}

export default StripeClass;