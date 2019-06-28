const { branchRequestHook } = require("./branch-handler");

module.exports.handler = async event => {
  if (typeof event.body !== "string") {
    console.error(`Body is not a string ${typeof event.body}`);
  }

  const requestBody = JSON.parse(event.body);

  console.log(`Body keys: ${Object.keys(requestBody)}`);

  if (!!requestBody.zen) {
    return Promise.resolve({
      statusCode: 200,
      body: requestBody.zen
    });
  }

  const response = await branchRequestHook(requestBody);

  return Promise.resolve({
    statusCode: response.status,
    body: JSON.stringify({ message: response.message })
  });
};
