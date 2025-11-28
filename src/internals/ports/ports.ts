import {ExpressServer} from "./http";
import Adapters from "../adapters";
import Services from "../services";
import {Environment} from "../../package/configs/environment";

class Ports {
    expressServer: ExpressServer

    constructor(adapters: Adapters, services: Services, environmentVariables: Environment) {
        this.expressServer = new ExpressServer(adapters, services, environmentVariables)
    }
}

export default Ports