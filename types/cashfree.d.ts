declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      subscriptionsCheckout(options: {
        subsSessionId: string;
        redirectTarget?: "_self" | "_blank";
      }): Promise<{
        error?: {
          message?: string;
        };
      }>;
    };
  }
}

export {};
