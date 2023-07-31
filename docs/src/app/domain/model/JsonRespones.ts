export type JsonResponse<T extends object | null> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | "clone"
> & {
  body: T;
};
