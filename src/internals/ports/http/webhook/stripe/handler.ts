import {Request, Response, Router} from "express";
import {SuccessResponse} from "../../../../../package/responses/success";
import {Environment} from "../../../../../package/configs/environment";
import {BadRequestError} from "../../../../../package/errors/customError";
import AccountServices from "../../../../services/accounts";
import Stripe from "stripe";

export default class Handler {
    router: Router;
    services: AccountServices;
    environmentVariables: Environment

    constructor(services: AccountServices, environmentVariables: Environment) {
        this.services = services;
        this.router = Router();
        this.environmentVariables = environmentVariables

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").post(this.process)

    }


    process = async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'];
        if (!sig) throw new BadRequestError("invalid signature")
        let stripe = new Stripe(this.environmentVariables.stripeCredential.secret)
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, this.environmentVariables.stripeCredential.webhookSecret);
        } catch (err: any) {
            throw new BadRequestError(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.async_payment_failed':
                const checkoutSessionAsyncPaymentFailed = event.data.object;
                break;
            case 'checkout.session.async_payment_succeeded':
                const checkoutSessionAsyncPaymentSucceeded = event.data.object;
                break;
            case 'checkout.session.completed':
                const session = event.data.object;
                await this.services.commands.activateAccount.handle(session.id)
                break
            case 'checkout.session.expired':
                const checkoutSessionExpired = event.data.object;
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new SuccessResponse(res).send();
    };
};
