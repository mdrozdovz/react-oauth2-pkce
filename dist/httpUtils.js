"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postWithXForm = void 0;
const errors_1 = require("./errors");
function buildUrlEncodedRequest(request) {
    let queryString = '';
    for (const [key, value] of Object.entries(request)) {
        queryString += `${queryString ? '&' : ''}${key}=${encodeURIComponent(value)}`;
    }
    return queryString;
}
async function postWithXForm(url, request) {
    return fetch(url, {
        method: 'POST',
        body: buildUrlEncodedRequest(request),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(async (response) => {
        if (!response.ok) {
            const responseBody = await response.text();
            throw new errors_1.FetchError(response.status, response.statusText, responseBody);
        }
        return response;
    });
}
exports.postWithXForm = postWithXForm;
