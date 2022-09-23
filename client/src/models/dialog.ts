
export interface IDialogOption {
    name: string,
    callback: (data?: any) => boolean
}

export interface IDialogField {
    key: string;
    props: any;
}

export interface IDialog {
    id: number;
    title: string;
    content: string;
    options: IDialogOption[];
    fields: IDialogField[];
}
