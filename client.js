require("dotenv").config();

const axios = require("axios");
const { USERNAME, TOKEN, JIRA_DOMAIN } = process.env;

const url = `https://${JIRA_DOMAIN}.atlassian.net/rest/api/3/issue`;
const authToken = Buffer.from(`${USERNAME}:${TOKEN}`).toString("base64");

class Client {
  getTransitions(issue) {
    return this.fetch
      .get(`/${issue}/transitions`)
      .then(res => res.data.transitions);
  }

  getNextTransitionId(issue, jiraStatusName) {
    return this.getTransitions(issue).then(transitions => {
      return transitions.find(transition => transition.name === jiraStatusName);
    });
  }

  postJiraTransition(issue, transitionId) {
    return this.fetch.post(`/${issue}/transitions`, {
      transition: {
        id: transitionId
      }
    });
  }

  constructor(url, authToken) {
    this.fetch = axios.create({
      baseURL: url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`
      }
    });
  }
}

const clientSingleton = new Client(url, authToken);

module.exports = {
  clientSingleton
};
