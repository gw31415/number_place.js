self.addEventListener("message", async (e) => {
  const wasm = await import("../../pkg/number_place_wasm");
  await wasm.default();
  const report = wasm.brute_force(e.data);
  postMessage(report);
});

export default {};
