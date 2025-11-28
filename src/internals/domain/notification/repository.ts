import {EmailParameters} from "./email";

export interface EmailRepository {
    send(email: EmailParameters): Promise<void>
}
// Do not let error disrupt flow