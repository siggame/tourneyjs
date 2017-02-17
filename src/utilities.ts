function permute(list: any[]) {
  let permutation = Array.from(list);
  let window = permutation.length;
  let temp;

  while (window > 0) {
    const random_index = Math.floor(Math.random() * window);
    window--;
    temp = permutation[window];
    permutation[window] = permutation[random_index];
    permutation[random_index] = temp;
  }

  return permutation;
}

export { permute };
