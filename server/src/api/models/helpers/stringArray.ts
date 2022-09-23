import T, { Template } from "tsplate";

export const TStringArray: <T>(separator: string, template: Template<T, string>) => Template<T[], string> = <T>(separator: string, template: Template<T, string>) => ({
    valid: (o: any): o is string => {
        return T.String.valid(o) && o.split(separator).every(template.valid)   
    },
    toModel: (s: string) => s.split(separator).map(template.toModel),
    toTransit: (ts: T[]) => ts.map(template.toTransit).join(separator)
});
