export const uuid = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substring(0, 5);

export const makeUuid = () => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5);
};
