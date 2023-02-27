import { Authenticator, Chain, UAL, User } from 'universal-authenticator-library';

// --------------------------------------------------
// WALLET METHODES
// --------------------------------------------------
// Includes:
// WalletUAL

export interface WalletUser extends User {
    accountName: string;
    requestPermission: string;
}

export class WalletUAL extends UAL {
    public isAutologin: boolean = false;

    protected static SESSION_EXPIRATION_KEY = 'ual-session-expiration';
    protected static SESSION_AUTHENTICATOR_KEY = 'ual-session-authenticator';
    protected static SESSION_ACCOUNT_NAME_KEY = 'ual-session-account-name';

    protected static AUTHENTICATOR_LOADING_INTERVAL = 250;

    protected userCallbackHandler: (users: WalletUser[]) => any;
    protected accountNameInputValue: string = '';
    protected activeAuthenticator?: Authenticator;

    /**
     *
     * @param userCallbackHandler Called with the array of users after a successful authenticator selection
     * @param chains Array of Chains the application wants to support
     * @param appName Name of the application
     * @param authenticators List of authenticators this app supports
     */
    constructor(
        userCallbackHandler: (users: WalletUser[]) => any,
        chains: Chain[],
        appName: string,
        authenticators: Authenticator[]
    ) {
        super(chains, appName, authenticators);

        this.userCallbackHandler = userCallbackHandler;

        this.loginUser = this.loginUser.bind(this);
    }

    /**
     * Initializes UAL: If a renderConfig was provided and no autologin authenticator
     * is returned it will render the Auth Button and relevant DOM elements.
     *
     */
    public init(): void {
        const authenticators = this.getAuthenticators();

        // perform this check first, if we're autologging in we don't render a dom
        if (!!authenticators.autoLoginAuthenticator) {
            this.isAutologin = true;
            this.loginUser(authenticators.autoLoginAuthenticator);
            this.activeAuthenticator = authenticators.autoLoginAuthenticator;
        } else {
            // check for existing session and resume if possible
            this.attemptSessionLogin(authenticators.availableAuthenticators);
        }
    }

    /**
     * Attempts to resume a users session if they previously logged in
     *
     * @param authenticators Available authenticators for login
     */
    private attemptSessionLogin(authenticators: Authenticator[]) {
        const sessionExpiration = localStorage.getItem(WalletUAL.SESSION_EXPIRATION_KEY) || null;
        if (sessionExpiration) {
            // clear session if it has expired and continue
            if (new Date(sessionExpiration) <= new Date()) {
                this.clearStorageKeys();
            } else {
                const authenticatorName = localStorage.getItem(WalletUAL.SESSION_AUTHENTICATOR_KEY);
                const sessionAuthenticator = authenticators.find(
                    (authenticator) => authenticator.getName() === authenticatorName
                ) as Authenticator;

                const accountName = localStorage.getItem(WalletUAL.SESSION_ACCOUNT_NAME_KEY) || undefined;
                this.loginUser(sessionAuthenticator, accountName);
            }
        }
    }

    /**
     * App developer can call this directly with the preferred authenticator or render a
     * UI to let the user select their authenticator
     *
     * @param authenticator Authenticator chosen for login
     * @param accountName Account name (optional) of the user logging in
     */
    public async loginUser(authenticator: Authenticator, accountName?: string) {
        let users: WalletUser[];

        // set the active authenticator so we can use it in logout
        this.activeAuthenticator = authenticator;

        const invalidateSeconds = this.activeAuthenticator.shouldInvalidateAfter();
        const invalidateAt = new Date();
        invalidateAt.setSeconds(invalidateAt.getSeconds() + invalidateSeconds);

        localStorage.setItem(WalletUAL.SESSION_EXPIRATION_KEY, invalidateAt.toString());
        localStorage.setItem(WalletUAL.SESSION_AUTHENTICATOR_KEY, authenticator.getName());

        try {
            await this.waitForAuthenticatorToLoad(authenticator);

            if (accountName) {
                users = (await authenticator.login(accountName)) as WalletUser[];

                localStorage.setItem(WalletUAL.SESSION_ACCOUNT_NAME_KEY, accountName);
            } else {
                users = (await authenticator.login()) as WalletUser[];

                // take the first user and use that as the account name
                if (users[0].accountName)
                    localStorage.setItem(WalletUAL.SESSION_ACCOUNT_NAME_KEY, users[0].accountName);
            }

            // send our users back
            this.userCallbackHandler(users);
        } catch (e: any) {
            console.error('Error', e);
            console.error('Error cause', e.cause ? e.cause : '');
            this.clearStorageKeys();
            throw e;
        }
    }

    private async waitForAuthenticatorToLoad(authenticator: Authenticator) {
        return new Promise<void>((resolve) => {
            if (!authenticator.isLoading()) {
                resolve();
                return;
            }
            const authenticatorIsLoadingCheck = setInterval(() => {
                if (!authenticator.isLoading()) {
                    clearInterval(authenticatorIsLoadingCheck);
                    resolve();
                }
            }, WalletUAL.AUTHENTICATOR_LOADING_INTERVAL);
        });
    }

    /**
     * Clears the session data for the logged in user
     */
    public async logoutUser() {
        if (!this.activeAuthenticator) {
            throw Error('No active authenticator defined, did you login before attempting to logout?');
        }

        this.activeAuthenticator.logout();

        this.clearStorageKeys();
    }

    private clearStorageKeys() {
        // clear out our storage keys
        localStorage.removeItem(WalletUAL.SESSION_EXPIRATION_KEY);
        localStorage.removeItem(WalletUAL.SESSION_AUTHENTICATOR_KEY);
        localStorage.removeItem(WalletUAL.SESSION_ACCOUNT_NAME_KEY);
    }
}
