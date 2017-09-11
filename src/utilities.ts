export function permute(list: any[]) {
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
