import App from "@/islands/App";
import { createRoute } from "honox/factory";

export default createRoute((c) => {
  return c.render(<App />);
});
