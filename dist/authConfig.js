"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.createInternalConfig = void 0;
function stringIsUnset(value) {
    const unset = ['', undefined, null];
    return unset.includes(value);
}
function createInternalConfig(passedConfig) {
    // Set default values for internal config object
    const { autoLogin = true, clearURL = true, decodeToken = true, scope = undefined, preLogin = () => null, postLogin = () => null, onRefreshTokenExpire = undefined, storage = 'local', storageKeyPrefix = 'ROCP_', refreshWithScope = true, refreshTokenExpiryStrategy = 'renewable', } = passedConfig;
    const config = {
        ...passedConfig,
        autoLogin: autoLogin,
        clearURL: clearURL,
        decodeToken: decodeToken,
        scope: scope,
        preLogin: preLogin,
        postLogin: postLogin,
        onRefreshTokenExpire: onRefreshTokenExpire,
        storage: storage,
        storageKeyPrefix: storageKeyPrefix,
        refreshWithScope: refreshWithScope,
        refreshTokenExpiryStrategy: refreshTokenExpiryStrategy,
    };
    validateConfig(config);
    return config;
}
exports.createInternalConfig = createInternalConfig;
function validateConfig(config) {
    if (stringIsUnset(config?.clientId))
        throw Error("'clientId' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config?.authorizationEndpoint))
        throw Error("'authorizationEndpoint' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config?.tokenEndpoint))
        throw Error("'tokenEndpoint' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (stringIsUnset(config?.redirectUri))
        throw Error("'redirectUri' must be set in the 'AuthConfig' object passed to 'react-oauth2-code-pkce' AuthProvider");
    if (!['session', 'local'].includes(config.storage))
        throw Error("'storage' must be one of ('session', 'local')");
    if (config?.extraAuthParams)
        console.warn("The 'extraAuthParams' configuration parameter will be deprecated. You should use " +
            "'extraTokenParameters' instead.");
    if (config?.extraAuthParams && config?.extraTokenParameters)
        console.warn("Using both 'extraAuthParams' and 'extraTokenParameters' is not recommended. " +
            "They do the same thing, and you should only use 'extraTokenParameters'");
}
exports.validateConfig = validateConfig;
