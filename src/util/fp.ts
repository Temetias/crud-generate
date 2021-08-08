export const make =
  <T1, T2>(Thing: { new (arg: T2): T1 }) =>
  (arg: T2) =>
    new Thing(arg);

export const reduceArrToObj = <T1, T2 extends object>(
  cb: (x: T1) => { [k: string]: T2 },
  arr: T1[]
) => arr.reduce((acc, cur) => ({ ...acc, ...cb(cur) }), {});
