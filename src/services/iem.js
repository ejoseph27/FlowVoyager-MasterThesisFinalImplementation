const { post } = require("./http");
const apiPath = `/portal/api/v1`;

// Function to fetch login credentials and login to IEM service
module.exports.login = (url, username, password) => {
    return new Promise((resolve, reject) =>
        post(`https://${url}:9443/${apiPath}/login/direct`, { username, password })
            .then(async (resp) => {
                if (resp.status === 200) {
                    return resp.json(); // convert the response to a json
                } else {
                    throw await resp.json()
                }
            })
            .then(json => resolve(json.data))
            .catch(err => reject(err.errors)));
}