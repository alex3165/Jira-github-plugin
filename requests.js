const axios = require('axios');

const createClient = (url, authToken) => {
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

  return { getNextTransitionId, postJiraTransition };
};

module.exports = {
  createClient
};
