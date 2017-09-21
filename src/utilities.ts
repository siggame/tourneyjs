/**
 * Creates a permutation (ie. random shuffle) of the input list.
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * 
 * @export
 */
export function permute(list: any[]): any[] {
  const permutation = Array.from(list);
  let window = permutation.length;
  let temp;

  while (window > 0) {
    const randomIndex = Math.floor(Math.random() * window);
    window--;
    temp = permutation[window];
    permutation[window] = permutation[randomIndex];
    permutation[randomIndex] = temp;
  }

  return permutation;
}
