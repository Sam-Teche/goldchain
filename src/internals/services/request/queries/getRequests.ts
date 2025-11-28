import {RequestRepository} from "../../../domain/request/repository";
import {IRequest, RequestFilter} from "../../../domain/request/request";

export class GetRequests {
    requestRepository: RequestRepository;

    constructor(
        requestRepository: RequestRepository,
    ) {
        this.requestRepository = requestRepository;
    }


    handle = async (filter: RequestFilter): Promise<IRequest[]> => {
        try {
            return await this.requestRepository.GetRequests(filter)
        } catch (error) {
            throw error;
        }
    };
}
