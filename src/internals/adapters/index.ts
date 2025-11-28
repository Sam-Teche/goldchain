import { Environment } from "../../package/configs/environment";
import AccountClass from "./account";
import { AccountRepository } from "../domain/account/repository";
import { EmailRepository } from "../domain/notification/repository";
import SMTPClass from "./notification/smtp";
import { StorageRepository } from "../domain/storage/repository";
import { S3StorageClass } from "./storage/s3";
import { S3Client } from "@aws-sdk/client-s3";
import { OTPRepository } from "../domain/otp/repository";
import OTPClass from "./otp";
import NoteClass from "./note";
import { AdminRepository } from "../domain/admin/repository";
import AdminClass from "./admin";
import Stripe from "stripe";
import StripeClass from "./payment/stripe";
import { ListingRepository } from "../domain/listing/repository";
import { ReviewRepository } from "../domain/review/repository";
import ListingClass from "./listing";
import ReviewClass from "./review";
import { RequestRepository } from "../domain/request/repository";
import RequestClass from "./request";
import { OfferRepository } from "../domain/offer/repository";
import OfferClass from "./offer";
import ChatClass from "./chat";
import { ChatRepository } from "../domain/chat/repository";
import {
  ChatWebsocketRepository,
  DefaultWebsocketRepository,
} from "../domain/websocket/repository";
import { ChatWebSocketClass, DefaultWebsocketClass } from "./websocket";
import { LedgerRepository } from "../domain/ledger/repository";
import LedgerClass from "./ledger";
import { EscrowRepository } from "../domain/escrow/repository";
import { EscrowClass } from "./escrow/escrow";
import { BlockchainRepository } from "../domain/blockchain/repository";
import { PolkadotBlockchainClass } from "./blockchain/blockchain.polkadot"; // NEW: Polkadot implementation

export type AdapterParameters = {
    environmentVariables: Environment;
    s3Client: S3Client;
    stripeClient: Stripe;
    };

    class Adapters {
    environmentVariables: Environment;
    accountRepository: AccountRepository;
    adminRepository: AdminRepository;
    otpRepository: OTPRepository;
    noteRepository: NoteClass;
    emailRepository: EmailRepository;
    storageRepository: StorageRepository;
    paymentRepository: StripeClass;
    listingRepository: ListingRepository;
    reviewRepository: ReviewRepository;
    requestRepository: RequestRepository;
    offerRepository: OfferRepository;
    chatRepository: ChatRepository;
    ledgerRepository: LedgerRepository;
    chatWebsocketRepository: ChatWebsocketRepository;
    defaultWebsocketRepository: DefaultWebsocketRepository;
    escrowRepository: EscrowRepository;
    blockchainRepository: BlockchainRepository;

    constructor(parameters: AdapterParameters) {
        this.environmentVariables = parameters.environmentVariables;
        this.accountRepository = new AccountClass();
        this.adminRepository = new AdminClass();
        this.otpRepository = new OTPClass();
        this.noteRepository = new NoteClass();
        this.listingRepository = new ListingClass();
        this.reviewRepository = new ReviewClass();
        this.requestRepository = new RequestClass();
        this.offerRepository = new OfferClass();
        this.chatRepository = new ChatClass();
        this.chatWebsocketRepository = new ChatWebSocketClass();
        this.defaultWebsocketRepository = new DefaultWebsocketClass();
        this.ledgerRepository = new LedgerClass();
        this.escrowRepository = new EscrowClass(parameters.environmentVariables);
        this.blockchainRepository = new PolkadotBlockchainClass(
          parameters.environmentVariables
        );
        this.emailRepository = new SMTPClass(
        parameters.environmentVariables.smtpCredential
        );
        this.storageRepository = new S3StorageClass(
        parameters.s3Client,
        parameters.environmentVariables.awsCredentials.region
        );
        this.paymentRepository = new StripeClass(
        parameters.stripeClient,
        parameters.environmentVariables
        );
    }

  /**
   * Initialize blockchain connection
   * Call this after creating adapters
   */
  async initializeBlockchain(): Promise<void> {
    if (this.blockchainRepository instanceof PolkadotBlockchainClass) {
      await this.blockchainRepository.initialize();
    }
  }
}

export default Adapters;
