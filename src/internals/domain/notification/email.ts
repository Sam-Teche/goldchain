export enum EmailType {
    HTML = 'HTML',
    TEXT = 'TEXT',
}

export type EmailParameters = {
    email: string,
    type: EmailType,
    subject: string,
    message: string
}
