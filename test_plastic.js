const N = 100000n;
const ten2N = 10n ** (2n * N);
const ten3N = 10n ** (3n * N);

let X = 1n * (10n ** N); // initial guess 1.0 * 10^N, but 1.324 is better
X = (13247n * (10n ** N)) / 100000n; // better initial guess

for (let i = 0; i < 20; i++) {
    const F = X ** 3n - X * ten2N - ten3N;
    if (F === 0n) break;
    const dF = 3n * (X ** 2n) - ten2N;
    const nextX = X - F / dF;
    if (nextX === X) break;
    console.log("Iteration", i, "diff length", (X - nextX).toString().length);
    X = nextX;
}

const str = X.toString();
console.log("Calculated", str.length, "digits");
// Calculate frequency
const freqs = new Array(10).fill(0);
for (let i = 0; i < str.length; i++) {
    freqs[parseInt(str[i])]++;
}
console.log("Frequencies:", freqs);
