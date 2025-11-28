import {config} from "dotenv";


config()

export type Polkadot = {
  rpcURL: string;
  secretKeyMnemonic: string;
  contractAddress: string;
};

export type AWSCredentials = {
    region: string
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
    s3BucketName: string
}

export type StripeCredential = {
    successURL: string
    cancelURL: string
    secret: string
    webhookSecret: string
}

export type SMTPCredentials = {
    fromAddress: string
    host: string
    port: number
    username: string
    password: string
}

export type RedirectUrl = {
    reviewOrderRequest: string
    reviewOffer: string
    completePurchase: string
    newOffer: string
}

export type EscrowCredentials = {
    email: string
    apiUrl: string
    sandboxAPIUrl: string
    apiKey: string
    sandboxAPIKey: string
    brokerPercentage: number
}

export type FinnHubCredentials = {
    apiUrl: string
    apiKey: string
}
// export type Solana = {
//     rpcURL: string
//     secretKeyArray: number[]
//     programId: PublicKey
// }

export class Environment {
  mongoDBConnectionString: string;

  cookieSecret: string;
  cookieExpires: number;
  cookieExpiresStay: number;

  jwtSecret: string;
  jwtExpires: number;
  jwtExpiresStay: number;

  verifyEmailUrl: string;
  resetPasswordUrl: string;

  nodeENV: string;
  port: number;
  url: string;
  wsURL: string;
  onlineURL: string;

  clientOrigin: string[];
  clientLoginUrl: string;

  smtpCredential: SMTPCredentials;

  supportEmail: string;

  awsCredentials: AWSCredentials;
  stripeCredential: StripeCredential;

  superAdmin: string;
  superAdminPassword: string;

  activationFee: number;

  defaultRequestExpiry: number;
  defaultOfferExpiry: number;

  redirectUrl: RedirectUrl;

  escrowCredential: EscrowCredentials;

  FinnHubCredential: FinnHubCredentials;

//   Solana: Solana;

  Polkadot: Polkadot;

  constructor() {
    (this.mongoDBConnectionString = this.getEnvironmentVariable(
      "MONGO_CONNECTION_STRING"
    )),
      (this.cookieSecret = this.getEnvironmentVariable("COOKIE_SECRET"));
    this.cookieExpires = this.getEnvironmentVariableAsNumber(
      "COOKIE_EXPIRES",
      1000 * 60 * 60
    );
    this.cookieExpiresStay = this.getEnvironmentVariableAsNumber(
      "COOKIE_EXPIRES_STAY",
      1000 * 60 * 60 * 24 * 7
    );

    this.jwtSecret = this.getEnvironmentVariable("JWT_SECRET");
    this.jwtExpires = this.getEnvironmentVariableAsNumber("JWT_EXPIRES", 3600);
    this.jwtExpiresStay = this.getEnvironmentVariableAsNumber(
      "JWT_EXPIRES_STAY",
      604800
    );

    this.verifyEmailUrl = this.getEnvironmentVariableOrFallback(
      "VERIFY_EMAIL_URL",
      "http://localhost:5000/api/v1/verify/email"
    );
    this.resetPasswordUrl = this.getEnvironmentVariableOrFallback(
      "RESET_PASSWORD_URL",
      "http://localhost:5000/api/v1/account/password/reset"
    );

    this.nodeENV = this.getEnvironmentVariableOrFallback(
      "NODE_ENV",
      "development"
    );
    this.port = this.getEnvironmentVariableAsNumber("PORT", 5000);
    this.url = this.getEnvironmentVariableOrFallback(
      "URL",
      "http://localhost:1364"
    );
    this.wsURL = this.getEnvironmentVariableOrFallback(
      "WS_URL",
      "ws://localhost:1364"
    );
    this.onlineURL = this.getEnvironmentVariableOrFallback(
      "ONLINE_URL",
      "http://localhost:5000"
    );

    this.clientOrigin = [
      this.getEnvironmentVariable("CLIENT_ORIGIN_1"),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_2",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_3",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_4",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_5",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_6",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_7",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_8",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_9",
        "http://localhost:3000"
      ),
      this.getEnvironmentVariableOrFallback(
        "CLIENT_ORIGIN_10",
        "http://localhost:3000"
      ),
    ];
    this.clientLoginUrl = this.getEnvironmentVariable("CLIENT_LOGIN_URL");

    this.smtpCredential = {
      fromAddress: this.getEnvironmentVariable("SMTP_FROM_ADDRESS"),
      host: this.getEnvironmentVariable("SMTP_HOST"),
      password: this.getEnvironmentVariable("SMTP_PASSWORD"),
      port: this.getEnvironmentVariableAsNumber("SMTP_PORT", 587),
      username: this.getEnvironmentVariable("SMTP_USERNAME"),
    };

    this.supportEmail = this.getEnvironmentVariable("SUPPORT_EMAIL");
    this.awsCredentials = {
      region: this.getEnvironmentVariable("AWS_REGION"),
      accessKeyId: this.getEnvironmentVariable("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.getEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
      sessionToken: this.getEnvironmentVariableOrFallback(
        "AWS_SESSION_TOKEN",
        ""
      )
        ? this.getEnvironmentVariableOrFallback("AWS_SESSION_TOKEN", "")
        : undefined,
      s3BucketName: this.getEnvironmentVariableOrFallback(
        "S3_BUCKET_NAME",
        "leasestash"
      ),
    };

    this.stripeCredential = {
      cancelURL: this.getEnvironmentVariable("CANCEL_URL"),
      secret: this.getEnvironmentVariable("STRIPE_SECRET"),
      webhookSecret: this.getEnvironmentVariable("WEBHOOK_STRIPE_SECRET"),
      successURL: this.getEnvironmentVariable("SUCCESS_URL"),
    };

    this.superAdmin = this.getEnvironmentVariable("SUPER_ADMIN");
    this.superAdminPassword = this.getEnvironmentVariable(
      "SUPER_ADMIN_PASSWORD"
    );

    this.activationFee = this.getEnvironmentVariableAsNumber(
      "ACTIVATION_FEE",
      50
    );

    this.defaultRequestExpiry = this.getEnvironmentVariableAsNumber(
      "DEFAULT_REQUEST_EXPIRY",
      172800000
    );
    this.defaultOfferExpiry = this.getEnvironmentVariableAsNumber(
      "DEFAULT_OFFER_EXPIRY",
      172800000
    );

    this.redirectUrl = {
      reviewOrderRequest: this.getEnvironmentVariableOrFallback(
        "REVIEW_ORDER_REQUEST",
        "https://google.com"
      ),
      reviewOffer: this.getEnvironmentVariableOrFallback(
        "REVIEW_OFFER",
        "https://google.com"
      ),
      completePurchase: this.getEnvironmentVariableOrFallback(
        "COMPLETE_PURCHASE",
        "https://google.com"
      ),
      newOffer: this.getEnvironmentVariableOrFallback(
        "NEW_OFFER",
        "https://google.com"
      ),
    };

    this.escrowCredential = {
      email: this.getEnvironmentVariable("ESCROW_EMAIL"),
      apiKey: this.getEnvironmentVariable("ESCROW_API_KEY"),
      apiUrl: this.getEnvironmentVariable("ESCROW_API_URL"),
      sandboxAPIKey: this.getEnvironmentVariable("ESCROW_SANDBOX_API_KEY"),
      sandboxAPIUrl: this.getEnvironmentVariable("ESCROW_SANDBOX_API_URL"),
      brokerPercentage: this.getEnvironmentVariableAsNumber(
        "ESCROW_BROKER_PERCENTAGE",
        2.5
      ),
    };

    this.FinnHubCredential = {
      apiKey: this.getEnvironmentVariable("FINN_HUB_API_KEY"),
      apiUrl: this.getEnvironmentVariable("FINN_HUB_API_URL"),
    };

    // this.Solana = {
    //   programId: new PublicKey(
    //     this.getEnvironmentVariable("SOLANA_PROGRAM_ID")
    //   ),
    //   rpcURL: this.getEnvironmentVariable("SOLANA_RPC_URL"),
    //   secretKeyArray: JSON.parse(
    //     this.getEnvironmentVariable("SOLANA_SECRET_KEY")
    //   ),
    // };

    this.Polkadot = {
      rpcURL: this.getEnvironmentVariable("POLKADOT_RPC_URL"),
      secretKeyMnemonic: this.getEnvironmentVariable(
        "POLKADOT_SECRET_MNEMONIC"
      ),
      contractAddress: this.getEnvironmentVariable("POLKADOT_CONTRACT_ADDRESS"),
    };

  }

  

  getEnvironmentVariable(key: string): string {
    let value = process.env[key];
    if (!value) {
      console.error(`Error: Environment variable "${key}" is not available.`);
      process.exit(1);
    }
    return value;
  }

  getEnvironmentVariableOrFallback(key: string, fallback: string): string {
    let value = process.env[key];
    if (!value) {
      return fallback;
    }
    return value;
  }

  getEnvironmentVariableAsNumber(key: string, fallback: number): number {
    let value = process.env[key];
    if (!value) {
      return fallback;
    }

    const valueNumber = Number(value);
    if (isNaN(valueNumber) || !isFinite(valueNumber)) {
      console.error(
        `Error: Environment variable "${key}" value "${value}" is not a valid number.`
      );
      process.exit(1);
    }

    return valueNumber;
  }

  getEnvironmentVariableAsBool(key: string, fallback: boolean): boolean {
    let value = process.env[key];
    if (!value) {
      return fallback;
    }

    const valueLower = value.toLowerCase();
    if (valueLower !== "true" && valueLower !== "false") {
      console.error(
        `Error: Environment variable "${key}" value "${value}" is not a valid boolean. Use "true" or "false".`
      );
      process.exit(1);
    }

    return valueLower === "true";
  }
}