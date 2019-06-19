const { pullRequestHook } = require('./handlers');

module.exports.pullRequest = async event => {
  const payload = JSON.parse(event.body);

  const response = await pullRequestHook(payload);

  return Promise.resolve({
    statusCode: response.status,
    body: JSON.stringify({ message: response.message })
  });
};
