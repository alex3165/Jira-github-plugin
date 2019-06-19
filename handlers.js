const { createClient } = require('./requests');

const { USERNAME, TOKEN, JIRA_DOMAIN } = process.env;

// TODO: Move those to env variables
const GITHUB_PR_OPEN = 'In Review';
const GITHUB_PR_MERGED = 'CLOSE';

const url = `https://${JIRA_DOMAIN}.atlassian.net/rest/api/3/issue`;
const authToken = Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64');

const { getNextTransitionId, postJiraTransition } = createClient(
  url,
  authToken
);

const pullRequestHook = bodyPayload => {
  if (typeof bodyPayload === 'string') {
    console.log('Parsing body payload since it is a string');
    bodyPayload = JSON.parse(bodyPayload);
  }

  const { action, pull_request } = bodyPayload;

  if (!pull_request) {
    console.error(
      'Not a Pull request payload, keys: ',
      Object.keys(bodyPayload)
    );

    return Promise.resolve({
      status: 200,
      message: 'Not a PR payload'
    });
  }

  const issue = pull_request.head.ref;
  console.log('Issue: ' + issue);

  let jiraStatusName;

  if (action === 'closed' && !!pull_request.merged) {
    jiraStatusName = GITHUB_PR_MERGED;
  }

  if (action === 'opened') {
    jiraStatusName = GITHUB_PR_OPEN;
  }

  if (!jiraStatusName) {
    console.error(
      `No matching jira status found, action: ${action}, merged: ${
        pull_request.merged
      }`
    );

    return Promise.resolve({
      status: 404,
      message: 'No matching jira status found'
    });
  }

  console.log(`Next Jira status name: ` + jiraStatusName);

  return getNextTransitionId(issue, jiraStatusName)
    .then(transition => {
      if (!transition) {
        console.error('No transition found: ' + JSON.stringify(transition));

        return {
          status: 500,
          message: 'No transition found'
        };
      }

      console.log('Next transition id: ' + transition.id);

      return postJiraTransition(issue, transition.id);
    })
    .then(data => {
      console.log('Successfully transitioned Jira task');

      return {
        status: 200,
        message: 'Successfully transitioned Jira task'
      };
    })
    .catch(err => {
      console.log('Error: ' + JSON.stringify(err));

      return {
        status: 500,
        message: JSON.stringify(err)
      };
    });
};

module.exports = {
  pullRequestHook
};
