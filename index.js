const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

const {
  USERNAME,
  TOKEN,
  JIRA_DOMAIN,
  GITHUB_PR_OPEN,
  GITHUB_BRANCH_OPEN,
  GITHUB_PR_MERGED
} = process.env;

const PORT = 4567;

const url = `https://${JIRA_DOMAIN}.atlassian.net/rest/api/3/issue`;

const authToken = Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fetch = axios.create({
  baseURL: url,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Basic ${authToken}`
  }
});

const getNextTransitionId = (issue, jiraStatusName) => {
  return fetch.get(`/${issue}/transitions`).then(res => {
    return res.data.transitions.find(
      transition => transition.name === jiraStatusName
    );
  });
};

const postJiraTransition = (issue, transitionId) => {
  return fetch.post(`/${issue}/transitions`, {
    transition: {
      id: transitionId
    }
  });
};

app.post('/pull_request', (req, res) => {
  const { action, pull_request } = JSON.parse(req.body.payload);

  if (!pull_request) {
    console.error('Not a Pull request payload, keys: ', Object.keys(req.body));

    res.status(200).send({ message: 'Not a PR payload' });
    return;
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
    res.status(404).send({ message: 'No matching jira status found' });
    return;
  }

  console.log(`Next Jira status name: ` + jiraStatusName);

  getNextTransitionId(issue, jiraStatusName)
    .then(transition => {
      if (!transition) {
        console.error('No transition found: ' + JSON.stringify(transition));

        throw new Error('No transition found');
      }

      console.log('Next transition id: ' + transition.id);
      return postJiraTransition(issue, transition.id);
    })
    .then(data => {
      console.log('Successfully transitioned Jira task');
      res.status(200).send({ message: 'Successfully transitioned Jira task' });
    })
    .catch(err => {
      console.log('Error: ' + JSON.stringify(err));
      res.status(500).send(err);
    });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
