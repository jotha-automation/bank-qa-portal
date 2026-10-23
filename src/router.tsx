import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import "@/lib/store";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // OPTIMIZATION: Reduce unnecessary re-fetching for demo environment
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

// OPTIMIZATION: Global hydration marker for Playwright automation
// This allows tests to reliably detect when the app is fully initialized
declare global {
  interface Window {
    __aptpHydrated?: boolean;
  }
}

if (typeof window !== "undefined") {
  // Mark hydration complete after initial render
  const markHydrated = () => {
    window.__aptpHydrated = true;
    document.body.setAttribute("data-hydrated", "true");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markHydrated);
  } else {
    markHydrated();
  }
}
