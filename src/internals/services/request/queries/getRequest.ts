import {RequestRepository} from "../../../domain/request/repository";
import {IRequest} from "../../../domain/request/request";

export class GetRequest {
    requestRepository: RequestRepository;

    constructor(
        requestRepository: RequestRepository,
    ) {
        this.requestRepository = requestRepository;
    }


    handle = async (requestId: string): Promise<IRequest> => {
        try {
            return await this.requestRepository.GetRequest(requestId)
        } catch (error) {
            throw error;
        }
    };
}
