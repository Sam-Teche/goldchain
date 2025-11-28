// import {EscrowRepository} from "../../domain/escrow/repository";
// import {CreateTransactionRequest, CreateTransactionResponse} from "../../domain/escrow/escrow";
// import {Environment} from "../../../package/configs/environment";
//
// export class EscrowClass implements EscrowRepository {
//     private readonly apiUrl: string;
//     private readonly apiKey: string;
//     private readonly email: string;
//
//     constructor(environmnetVariables: Environment) {
//         this.apiKey = environmnetVariables.nodeENV == "development" ?
//             environmnetVariables.escrowCredential.sandboxAPIKey : environmnetVariables.escrowCredential.apiKey;
//         this.apiUrl = environmnetVariables.nodeENV == "development" ?
//             environmnetVariables.escrowCredential.sandboxAPIUrl : environmnetVariables.escrowCredential.apiUrl;
//         this.email = environmnetVariables.escrowCredential.email
//     }
//
//     async createTransaction(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
//         const url = `${this.apiUrl}/transaction`;
//
//         const auth = btoa(`${this.email}:${this.apiKey}`);
//
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Basic ${auth}`
//             },
//             body: JSON.stringify(request)
//         });
//
//         if (!response.ok) {
//             console.log({response})
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//
//         return await response.json();
//     }
// }

import axios, {AxiosResponse} from 'axios';
import {EscrowRepository} from "../../domain/escrow/repository";
import {CreateTransactionRequest, CreateTransactionResponse} from "../../domain/escrow/escrow";
import {Environment} from "../../../package/configs/environment";

export class EscrowClass implements EscrowRepository {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly email: string;

    constructor(environmentVariables: Environment) {
        this.apiKey = environmentVariables.nodeENV == "development" ?
            environmentVariables.escrowCredential.sandboxAPIKey : environmentVariables.escrowCredential.apiKey;
        this.apiUrl = environmentVariables.nodeENV == "development" ?
            environmentVariables.escrowCredential.sandboxAPIUrl : environmentVariables.escrowCredential.apiUrl;
        this.email = environmentVariables.escrowCredential.email
    }

    async cancelTransaction(reference: string, reason: string): Promise<void> {
        const url = `${this.apiUrl}/transaction/${reference}`;

        const auth = Buffer.from(`${this.email}:${this.apiKey}`).toString('base64');

        try {
            await axios.patch(url, {
                "action": "cancel",
                "cancel_information": {
                    "cancellation_reason": reason
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                }
            });

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log({error: error.response?.data, status: error.response?.status});
                console.log({error: error.response?.data.errors, status: error.response?.status});
                console.log({error: error.response?.data.errors.items["0"]?.type, status: error.response?.status});
                console.log({error: error.response?.data.errors.items["0"]._schema, status: error.response?.status});
                console.log({
                    error: error.response?.data.errors.items["0"].inspection_period,
                    status: error.response?.status
                });
                console.log({error: error.response?.data.errors.items, status: error.response?.status});
                console.log({error: error.response?.data.errors.parties["0"], status: error.response?.status});
                console.log({error: error.response?.data.errors.parties["2"], status: error.response?.status});
                console.log({error: error.response?.data.errors, status: error.response?.status});

                throw new Error(`HTTP error! status: ${error.response?.status}`);
            }
            throw error;
        }
    }

    async createTransaction(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
        const url = `${this.apiUrl}/transaction`;

        const auth = Buffer.from(`${this.email}:${this.apiKey}`).toString('base64');

        try {
            const response: AxiosResponse<CreateTransactionResponse> = await axios.post(url, request, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                }
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // console.log({error: error.response?.data, status: error.response?.status});
                // console.log({error: error.response?.data.errors, status: error.response?.status});
                // // console.log({error: error.response?.data.errors.items["0"]?.type, status: error.response?.status});
                // // console.log({error: error.response?.data.errors.items["0"]._schema, status: error.response?.status});
                // // console.log({
                // //     error: error.response?.data.errors.items["0"].inspection_period,
                // //     status: error.response?.status
                // // });
                // // console.log({error: error.response?.data.errors.items, status: error.response?.status});
                // console.log({error: error.response?.data.errors.parties["0"], status: error.response?.status});
                // console.log({error: error.response?.data.errors.parties["2"], status: error.response?.status});
                // console.log({error: error.response?.data.errors, status: error.response?.status});
                throw new Error(`HTTP error! status: ${error.response?.status}`);
            }
            throw error;
        }
    }
}