import {Request, Response, Router} from "express";
import {z} from "zod";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import {SuccessResponse} from "../../../../package/responses/success";
import {MulterConfig} from "../../../../package/utils/multer";
import {Multer} from "multer";
import {StorageRepository} from "../../../domain/storage/repository";
import {BadRequestError} from "../../../../package/errors/customError";
import {Environment} from "../../../../package/configs/environment";

export default class Handler {
    router: Router;
    accountServices: AccountServices;
    storageRepository: StorageRepository;
    environmentVariables: Environment;
    multer: Multer

    constructor(accountServices: AccountServices, storageRepository: StorageRepository, environmentVariables: Environment) {
        this.accountServices = accountServices;
        this.storageRepository = storageRepository;
        this.environmentVariables = environmentVariables;
        this.router = Router();
        this.multer = new MulterConfig(500 * 1024 * 1024).multer

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/")
            .post(Authorize(this.accountServices), this.multer.array("files"), this.upload)
    }


    upload = async (req: Request, res: Response) => {
        let files = req.files as Express.Multer.File[]
        if (!files || files.length < 1) throw new BadRequestError("provide at least one file")

        let urls = []
        for await (const file of files) {
            let url = await this.storageRepository.upload(
                file,
                this.environmentVariables.awsCredentials.s3BucketName
            );
            urls.push(url)
        }

        new SuccessResponse(res, {
            urls: urls
        }).send();
    };
};
