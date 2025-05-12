onmessage = async (e) => {
  const wasm = await import("/pkg/number_place_wasm.js");
  await wasm.default();
  const report = wasm.brute_force(e.data);
  postMessage(report);
};
