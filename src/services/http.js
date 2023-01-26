const fs = require('fs');
const FormData = require('form-data');

// post request to IEM API's
module.exports.post = (url, body) => {
  return fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body) // body data type must match "Content-Type" header
  })
}

// Function to send .app as multi-part request to IEM catalog
module.exports.multipartPost = (url, token, appFile) => {
  return new Promise((resolve, reject) => {
    let readStream = fs.createReadStream(appFile);
    const formData = new FormData();
    formData.append('file to import', readStream)
    formData.submit({ protocol: 'https:', host: url, port: '9443', path: '/portal/api/v1/application-import-jobs', headers: { Authorization: token } }, async (err, res) => {
      if (err) {
        reject(err);
        return
      }
      let response = '';
      for await (const chunk of res) {
        response = chunk.toString();
      }
      if (res.statusCode == 200 || res.statusCode == 202) {
        resolve(response)
      }
      else {
        reject(response)
      }
    })
  })
}