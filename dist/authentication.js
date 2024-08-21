"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateState = exports.redirectToLogout = exports.fetchWithRefreshToken = exports.fetchTokens = exports.redirectToLogin = void 0;
const httpUtils_1 = require("./httpUtils");
const pkceUtils_1 = require("./pkceUtils");
const codeVerifierStorageKey = 'PKCE_code_verifier';
const stateStorageKey = 'ROCP_auth_state';
async function redirectToLogin(config, customState, additionalParameters, method = 'redirect') {
    const storage = config.storage === 'session' ? sessionStorage : localStorage;
    // Create and store a random string in storage, used as the 'code_verifier'
    const codeVerifier = (0, pkceUtils_1.generateRandomString)(96);
    storage.setItem(codeVerifierStorageKey, codeVerifier);
    // Hash and Base64URL encode the code_verifier, used as the 'code_challenge'
    return (0, pkceUtils_1.generateCodeChallenge)(codeVerifier, config.hashingFn).then((codeChallenge) => {
        // Set query parameters and redirect user to OAuth2 authentication endpoint
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            ...config.extraAuthParameters,
            ...additionalParameters,
        });
        if (config.scope !== undefined && !params.has('scope')) {
            params.append('scope', config.scope);
        }
        storage.removeItem(stateStorageKey);
        const state = customState ?? config.state;
        if (state) {
            storage.setItem(stateStorageKey, state);
            params.append('state', state);
        }
        const loginUrl = `${config.authorizationEndpoint}?${params.toString()}`;
        // Call any preLogin function in authConfig
        if (config?.preLogin)
            config.preLogin();
        if (method === 'popup') {
            const handle = window.open(loginUrl, 'loginPopup', 'popup width=600 height=600');
            if (handle)
                return;
            console.warn('Popup blocked. Redirecting to login page. Disable popup blocker to use popup login.');
        }
        window.location.assign(loginUrl);
    });
}
exports.redirectToLogin = redirectToLogin;
// This is called a "type predicate". Which allow us to know which kind of response we got, in a type safe way.
function isTokenResponse(body) {
    return body.access_token !== undefined;
}
function postTokenRequest(tokenEndpoint, tokenRequest) {
    return (0, httpUtils_1.postWithXForm)(tokenEndpoint, tokenRequest).then((response) => {
        return response.json().then((body) => {
            if (isTokenResponse(body)) {
                return body;
            }
            throw Error(JSON.stringify(body));
        });
    });
}
const fetchTokens = (config) => {
    const storage = config.storage === 'session' ? sessionStorage : localStorage;
    /*
      The browser has been redirected from the authentication endpoint with
      a 'code' url parameter.
      This code will now be exchanged for Access- and Refresh Tokens.
    */
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const codeVerifier = storage.getItem(codeVerifierStorageKey);
    if (!authCode) {
        throw Error("Parameter 'code' not found in URL. \nHas authentication taken place?");
    }
    if (!codeVerifier) {
        throw Error("Can't get tokens without the CodeVerifier. \nHas authentication taken place?");
    }
    const tokenRequest = {
        grant_type: 'authorization_code',
        code: authCode,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
        ...config.extraTokenParameters,
        // TODO: Remove in 2.0
        ...config.extraAuthParams,
    };
    return postTokenRequest(config.tokenEndpoint, tokenRequest);
};
exports.fetchTokens = fetchTokens;
const fetchWithRefreshToken = (props) => {
    const { config, refreshToken } = props;
    const refreshRequest = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        ...config.extraTokenParameters,
    };
    if (config.refreshWithScope)
        refreshRequest.scope = config.scope;
    return postTokenRequest(config.tokenEndpoint, refreshRequest);
};
exports.fetchWithRefreshToken = fetchWithRefreshToken;
function redirectToLogout(config, token, refresh_token, idToken, state, logoutHint, additionalParameters) {
    const params = new URLSearchParams({
        token: refresh_token || token,
        token_type_hint: refresh_token ? 'refresh_token' : 'access_token',
        client_id: config.clientId,
        post_logout_redirect_uri: config.logoutRedirect ?? config.redirectUri,
        ui_locales: window.navigator.languages.join(' '),
        ...config.extraLogoutParameters,
        ...additionalParameters,
    });
    if (idToken)
        params.append('id_token_hint', idToken);
    if (state)
        params.append('state', state);
    if (logoutHint)
        params.append('logout_hint', logoutHint);
    window.location.assign(`${config.logoutEndpoint}?${params.toString()}`);
}
exports.redirectToLogout = redirectToLogout;
function validateState(urlParams, storageType) {
    const storage = storageType === 'session' ? sessionStorage : localStorage;
    const receivedState = urlParams.get('state');
    const loadedState = storage.getItem(stateStorageKey);
    if (receivedState !== loadedState) {
        throw new Error('"state" value received from authentication server does no match client request. Possible cross-site request forgery');
    }
}
exports.validateState = validateState;
