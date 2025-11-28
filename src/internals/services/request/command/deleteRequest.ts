import {RequestRepository} from "../../../domain/request/repository";

export class DeleteRequest {
    requestRepository: RequestRepository;

    constructor(
        requestRepository: RequestRepository,
    ) {
        this.requestRepository = requestRepository;
    }


    handle = async (requestId: string, accountId: string): Promise<void> => {
        try {
            await this.requestRepository.DeleteRequest(requestId, accountId)
        } catch (error) {
            throw error;
        }
    };
}
