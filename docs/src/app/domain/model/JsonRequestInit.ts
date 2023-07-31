import { FetchArgs } from "return-fetch";

export type JsonRequestInit = Omit<NonNullable<FetchArgs[1]>, "body"> & {
  body?: object;
};
