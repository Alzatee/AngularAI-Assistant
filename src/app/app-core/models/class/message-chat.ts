export class MessageChat {
    text: string = '';
    fileUrl: string | ArrayBuffer | null = null;
    file: File | null = null;
    documentName: string | undefined = '';
    fileType: string | undefined = '';
    validationMessage: string | null = '';

    constructor(init?: Partial<MessageChat>) {
        Object.assign(this, init);
    }
}