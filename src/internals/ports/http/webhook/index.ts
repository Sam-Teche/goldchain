import {Router} from "express";
import Services from "../../../services";
import {Environment} from "../../../../package/configs/environment";
import StripeHandler from "./stripe/handler";
import EscrowHandler from "./escrow/handler";

export default class WebhookRouter {
    router: Router
    services: Services
    environmentVariables: Environment

    constructor(services: Services, environmentVariables: Environment) {
        this.router = Router()
        this.services = services
        this.environmentVariables = environmentVariables

        this.stripe();
        this.escrow();
    }

    stripe = () => {
        const router = new StripeHandler(this.services.accountServices, this.environmentVariables);
        this.router.use("/stripe", router.router);
    };

    escrow = () => {
        const router = new EscrowHandler(this.services.accountServices, this.environmentVariables, this.services.ledgerServices);
        this.router.use("/escrow", router.router);
    };
}