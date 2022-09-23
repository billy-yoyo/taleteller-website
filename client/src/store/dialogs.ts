import { writable, Writable } from "svelte/store";
import type { IDialog, IDialogField, IDialogOption } from "../models/dialog";

export const dialogStore: Writable<IDialog[]> = writable([]);

export const openDialog = (dialog: IDialog) => {
    dialogStore.update(current => {
        if (current.find(d => d.id === dialog.id)) {
            return current;
        } else {
            return [...current, dialog];
        }
    });
};

export const closeDialog = (dialogId: number) => {
    dialogStore.update(current => {
        return current.filter(d => d.id !== dialogId);
    });
};

let idCounter = { id: 1 }

export const createDialog = (title: string, content: string, options: IDialogOption[], fields?: IDialogField[]): IDialog => {
    return {
        id: idCounter.id++,
        title,
        content,
        options,
        fields: fields ?? []
    };
};

export const spawnDialog = (title: string, content: string, options: IDialogOption[]) => {
    openDialog(createDialog(title, content, options));
};

export const yesNoDialog = (title: string, content: string, onYes: () => void, onNo?: () => void) => {
    spawnDialog(title, content, [
        { name: 'Yes', callback: () => { onYes(); return true; } },
        { name: 'No', callback: () => true }
    ])
};

export const spawnDialogAndWaitForAnswer = async (title: string, content: string, options: string[], fields?: IDialogField[]): Promise<{ name: string, data: any }> => {
    return new Promise((res) => {
        openDialog(createDialog(title, content, options.map(name => ({ name, callback: (data) => { res({ name, data }); return true; } })), fields));
    });
}

export const spawnYesNoDialogAndWaitForAnswer = async (title: string, content: string): Promise<boolean> => {
    const yesText = 'Yes';
    const noText = 'No';

    const response = await spawnDialogAndWaitForAnswer(title, content, [yesText, noText]);
    return response.name === yesText;
};
