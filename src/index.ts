import { Environment } from "./package/configs/environment";
import { mongoClient, s3Client } from "./package/utils/connections";
import Adapters, { AdapterParameters } from "./internals/adapters";
import Services from "./internals/services";
import Ports from "./internals/ports/ports";
import Stripe from "stripe";

const main = async () => {
  const environmentVariables = new Environment();

  mongoClient(environmentVariables.mongoDBConnectionString).then(() => {
    console.log("Connected to Mongo DB");
  });
  const stripeClient = new Stripe(environmentVariables.stripeCredential.secret);

  let adapterParameters: AdapterParameters = {
    environmentVariables,
    s3Client: s3Client(environmentVariables.awsCredentials),
    stripeClient,
  };

  let adapters = new Adapters(adapterParameters);

  // NEW: Initialize blockchain connection
  await adapters.initializeBlockchain();

  let services = new Services(adapters);

  let ports = new Ports(adapters, services, environmentVariables);
  ports.expressServer.listen();
};

main().then();
