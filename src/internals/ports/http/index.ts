import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import { Environment } from "../../../package/configs/environment";
import Services from "../../services";
import Adapters from "../../adapters";
import Route404 from "../../../package/middleware/invalidRoute";
import ErrorHandlerMiddleware from "../../../package/middleware/errorHandler";
import { SuccessResponse } from "../../../package/responses/success";
import morganMiddleware from "../../../package/middleware/morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import WebhookRouter from "./webhook";
import AuthenticationHandler from "./authentication/handler";
import ProfileHandler from "./profile/handler";
import ListingHandler from "./listing/handler";
import RequestHandler from "./request/handler";
import OfferHandler from "./offer/handler";
import ChatHandler from "./chat/handler";
import UploadHandler from "./upload/handler";
import AccountHandler from "./account/handler";
import LedgerHandler from "./ledger/handler";
import AdminRouter from "./admin";
import cors from "cors";
import {
  Authorize,
  AuthorizeAdmin,
  ConversationAccess,
} from "../../../package/middleware/authorization";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { CustomError } from "../../../package/errors/customError";
import { undefined } from "zod";
import {
  FinnHubMessage,
  FinnHubSubscription,
  GoldPriceMessage,
} from "../../domain/price/price";

export class ExpressServer {
  adapters: Adapters;
  services: Services;
  environmentVariables: Environment;
  port: number;
  server: Express;
  bareServer: http.Server;
  websocketServer: WebSocketServer;
  finnWebsocket: WebSocket | null = null;
  apiRouter: Router;
  retryTimeout: NodeJS.Timeout | null = null;

  constructor(
    adapters: Adapters,
    services: Services,
    environmentVariables: Environment
  ) {
    this.adapters = adapters;
    this.services = services;
    this.environmentVariables = environmentVariables;
    this.port = environmentVariables.port;
    this.server = express();
    this.bareServer = http.createServer(this.server);
    this.websocketServer = new WebSocketServer({ server: this.bareServer }); // Single server
    this.apiRouter = express.Router();

    this.server.use((req, res, next) => {
      if (req.originalUrl === "/api/v1/webhook/stripe") {
        express.raw({ type: "application/json" })(req, res, next);
      } else {
        express.json()(req, res, next);
      }
    });
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(helmet());
    this.server.use(cookieParser(environmentVariables.cookieSecret));
    this.server.use(morganMiddleware);
    const corsOptions = {
      origin: this.environmentVariables.clientOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "ngrok-skip-browser-warning", // Important for ngrok
      ],
    };
    this.server.use(cors(corsOptions));

    this.connectToFinnHub();
    this.websocketSetup();

    this.health();
    this.webhook();
    this.admin();
    this.authentication();
    this.profile();
    this.listing();
    this.request();
    this.offer();
    this.chat();
    this.upload();
    this.account();
    this.ledger();

    this.server.use(`/api/v1`, this.apiRouter);

    this.server.use(Route404);
    this.server.use(ErrorHandlerMiddleware);
  }

  listen = () => {
    this.bareServer.listen(this.port, () => {
      console.log(`Server running on ${this.environmentVariables.url}`);
      this.environmentVariables.nodeENV == "development" &&
        console.log(`Server running on ${this.environmentVariables.onlineURL}`);
    });
  };

  connectToFinnHub(): void {
    if (this.finnWebsocket?.readyState === WebSocket.OPEN) {
      console.log("Already connected to FinnHub");
      return;
    }

    try {
      this.finnWebsocket = new WebSocket(
        `${this.adapters.environmentVariables.FinnHubCredential.apiUrl}?token=${this.adapters.environmentVariables.FinnHubCredential.apiKey}`
      );
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
      return;
    }

    this.finnWebsocket.addEventListener("open", () => {
      console.log("Connected to FinnHub");

      // Subscribe to gold prices
      const subscription: FinnHubSubscription = {
        type: "subscribe",
        symbol: "OANDA:XAU_USD",
      };

      try {
        this.finnWebsocket?.send(JSON.stringify(subscription));
        console.log("Subscribed to XAU/USD prices");
      } catch (error) {
        console.error("Failed to subscribe:", error);
      }
    });

    this.finnWebsocket.addEventListener("message", (event) => {
      try {
        const msg: FinnHubMessage = JSON.parse(event.data.toString());

        if (msg.type === "trade" && msg.data && msg.data.length > 0) {
          const tradeData = msg.data[0];
          const priceMessage: GoldPriceMessage = {
            type: "gold_price",
            price: tradeData.p,
            timestamp: tradeData.t,
          };

          this.adapters.defaultWebsocketRepository.Broadcast({
            data: priceMessage,
            type: "price",
          });
        }
      } catch (error) {
        console.error("Error parsing FinnHub message:", error);
      }
    });

    this.finnWebsocket.addEventListener("close", (event) => {
      console.log(
        `🔁 FinnHub connection closed (Code: ${event.code}, Reason: ${event.reason})`
      );
      this.finnWebsocket = null;
      this.scheduleReconnect();
    });

    this.finnWebsocket.on("error", (error: Error) => {
      console.error("FinnHub WebSocket error:", error.message);
      if (this.finnWebsocket) {
        this.finnWebsocket.close();
      }
    });
  }

  scheduleReconnect(): void {
    const RECONNECT_DELAY: number = 3000;

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const delay = RECONNECT_DELAY;
    console.log(`Reconnecting in ${delay}ms...`);

    this.retryTimeout = setTimeout(() => {
      this.connectToFinnHub();
    }, delay);
  }

  websocketSetup = () => {
    this.websocketServer.on("connection", async (ws, request) => {
      if (!request.url) {
        ws.close(1002, "Invalid path");
        return;
      }

      const { pathname } = new URL(
        request.url,
        this.environmentVariables.wsURL
      );

      if (pathname.startsWith("/chat")) {
        try {
          let conversationId = await ConversationAccess(
            request,
            this.services.chatServices
          );
          (ws as any).conversationId = conversationId;
          (ws as any).type = "chat";

          this.adapters.chatWebsocketRepository.Register(ws, conversationId);

          ws.on("error", () => {
            this.adapters.chatWebsocketRepository.Unregister(
              ws,
              conversationId
            );
          });

          ws.on("close", () => {
            this.adapters.chatWebsocketRepository.Unregister(
              ws,
              conversationId
            );
          });

          ws.on("message", (data) => {});

          ws.send("chat connected");
        } catch (err) {
          console.log(err);
          if (err instanceof CustomError) {
            let closeCode = 1011; // Internal error
            if (err.statusCode === 401) closeCode = 1008; // Policy violation (unauthorized)
            if (err.statusCode === 403) closeCode = 1008; // Policy violation (forbidden)
            if (err.statusCode === 404) closeCode = 1002; // Protocol error (not found)
            ws.close(closeCode, err.message);
          } else {
            ws.close(1011, "Internal server error");
          }
        }
      } else if (pathname === "/price") {
        (ws as any).type = "price";

        this.adapters.defaultWebsocketRepository.Register(ws);

        ws.on("error", () => {
          this.adapters.defaultWebsocketRepository.Unregister(ws);
        });

        ws.on("close", () => {
          this.adapters.defaultWebsocketRepository.Unregister(ws);
        });

        ws.on("message", (data) => {});

        ws.send("price connected");
      } else {
        ws.close(1002, "Unknown path");
      }
    });
  };

  health = () => {
    this.server.get("/health", (_: Request, res: Response) => {
      new SuccessResponse(res).send();
    });
    this.apiRouter.get(
      "/health/auth",
      Authorize(this.services.accountServices),
      (req: Request, res: Response) => {
        new SuccessResponse(res, { account: req.account }).send();
      }
    );
    this.apiRouter.get(
      "/health/auth/admin",
      AuthorizeAdmin(this.services.adminServices),
      (req: Request, res: Response) => {
        new SuccessResponse(res, { admin: req.admin }).send();
      }
    );
  };

  webhook = () => {
    const router = new WebhookRouter(this.services, this.environmentVariables);
    this.apiRouter.use("/webhook", router.router);
  };

  admin = () => {
    const router = new AdminRouter(this.services);
    this.apiRouter.use("/admin", router.router);
  };

  authentication = () => {
    const router = new AuthenticationHandler(this.services.accountServices);
    this.apiRouter.use("/auth", router.router);
  };

  profile = () => {
    const router = new ProfileHandler(
      this.services.accountServices,
      this.services.reviewServices
    );
    this.apiRouter.use("/profile", router.router);
  };

  listing = () => {
    const router = new ListingHandler(
      this.services.accountServices,
      this.services.listingServices,
      this.services.reviewServices
    );
    this.apiRouter.use("/listing", router.router);
  };

  request = () => {
    const router = new RequestHandler(
      this.services.accountServices,
      this.services.listingServices,
      this.services.requestServices
    );
    this.apiRouter.use("/request", router.router);
  };

  offer = () => {
    const router = new OfferHandler(
      this.services.accountServices,
      this.services.listingServices,
      this.services.offerServices
    );
    this.apiRouter.use("/offer", router.router);
  };

  chat = () => {
    const router = new ChatHandler(
      this.services.accountServices,
      this.services.chatServices
    );
    this.apiRouter.use("/chat", router.router);
  };

  upload = () => {
    const router = new UploadHandler(
      this.services.accountServices,
      this.adapters.storageRepository,
      this.environmentVariables
    );
    this.apiRouter.use("/upload", router.router);
  };

  account = () => {
    const router = new AccountHandler(this.services.accountServices);
    this.apiRouter.use("/account", router.router);
  };

  ledger = () => {
    const router = new LedgerHandler(
      this.services.accountServices,
      this.services.ledgerServices
    );
    this.apiRouter.use("/ledger", router.router);
  };
}
