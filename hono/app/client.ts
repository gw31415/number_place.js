import { createClient } from "honox/client";
import type { ReactNode } from "react";

createClient({
  hydrate: async (elem, root) => {
    const { hydrateRoot } = await import("react-dom/client");
    hydrateRoot(root, elem as unknown as ReactNode);
  },
  createElement: async (type, props) => {
    const { createElement } = await import("react");
    return createElement(type, props) as unknown as Element;
  },
});
