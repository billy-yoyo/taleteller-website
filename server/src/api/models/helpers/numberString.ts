import T, { Template } from "tsplate";

export const TFloatString: Template<number, string> = {
    valid: (o: any): o is string => T.String.valid(o) && T.Float.valid(parseInt(o)),
    toModel: (t: string) => parseFloat(t),
    toTransit: (n: number) => `${n}`
};

export const TIntString: Template<number, string> = {
    valid: (o: any): o is string => T.String.valid(o) && T.Int.valid(parseInt(o)),
    toModel: (t: string) => parseInt(t),
    toTransit: (n: number) => `${n}`
};
