// --------------------------------------------------
// ANALYTICS METHODES
// --------------------------------------------------
// Includes:
// usePosthog

declare global {
    interface Window {
        posthog: any;
    }
}

export const usePosthog = (config: Record<string, string> = {}) => ({
    track(eventName: string, props: { [key: string]: string | number }) {
        window?.posthog?.capture(eventName, {
            ...props,
            ...config,
        });
    },
    identify(accountName: string) {
        window?.posthog?.identify(accountName);
    },
});
