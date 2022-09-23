import T, { ModelType } from "tsplate";

export const TLogin = T.Object({
    username: T.String,
    password: T.String
});
export type ILogin = ModelType<typeof TLogin>;

export const TSignup = T.Object({
    username: T.String,
    password: T.String,
    name: T.String
});
export type ISignup = ModelType<typeof TSignup>;
