const { pullRequestHook } = require("./pr-handler");
const qs = require("qs");

module.exports.handler = async event => {
  if (typeof event.body !== "string") {
    console.error(`Body is not a string ${typeof event.body}`);
  }

  const requestBody = qs.parse(event.body);

  if (!requestBody.payload) {
    console.error("Payload is undefined, body: " + event.body);

    return Promise.resolve({
      statusCode: 500,
      body: "Payload not parsed"
    });
  }

  const response = await pullRequestHook(requestBody.payload);

  return Promise.resolve({
    statusCode: response.status,
    body: JSON.stringify({ message: response.message })
  });
};
