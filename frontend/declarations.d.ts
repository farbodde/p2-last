declare module "*.css";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            error_callback?: () => void;
            use_fedcm_for_prompt?: boolean;
            auto_select?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export {};
