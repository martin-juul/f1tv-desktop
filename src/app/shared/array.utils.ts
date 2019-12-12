export function sortByDateDesc(field: string) {
  return function (a, b) {
    return new Date(b.startDate).valueOf() - new Date(a.startDate).valueOf();
  };
}
