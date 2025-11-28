import Services from "../../../services";
import {Router} from "express";
import AuthenticationHandler from "./authentication/handler";
import AccountHandler from "./account/handler";
import ProfileHandler from "./profile/handler";
import ListingHandler from "./listing/handler";

export default class AdminRouter {
    router: Router
    services: Services

    constructor(services: Services) {
        this.router = Router()
        this.services = services

        this.authentication();
        this.account();
        this.profile();
        this.listing();
    }

    authentication = () => {
        const router = new AuthenticationHandler(this.services.adminServices);
        this.router.use("/auth", router.router);
    };

    account = () => {
        const router = new AccountHandler(this.services.accountServices, this.services.adminServices, this.services.noteServices);
        this.router.use("/accounts", router.router);
    };

    profile = () => {
        const router = new ProfileHandler(this.services.adminServices);
        this.router.use("/profile", router.router);
    };

    listing = () => {
        const router = new ListingHandler(this.services.adminServices, this.services.listingServices, this.services.reviewServices);
        this.router.use("/listing", router.router);
    };

}