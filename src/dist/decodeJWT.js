"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = void 0;
/**
 * Decodes the base64 encoded JWT. Returns a TToken.
 */
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join(''));
        return JSON.parse(jsonPayload);
    }
    catch (e) {
        console.error(e);
        throw Error('Failed to decode the access token.\n\tIs it a proper JSON Web Token?\n\t' +
            "You can disable JWT decoding by setting the 'decodeToken' value to 'false' the configuration.");
    }
};
exports.decodeJWT = decodeJWT;
