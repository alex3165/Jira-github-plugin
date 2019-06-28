const { clientSingleton } = require("./client");

describe("client", () => {
  it("Should retrieve all jira transactions", async () => {
    try {
      const transitions = await clientSingleton.getTransitions("TEST-1");

      expect(transitions.length).toEqual(4);
    } catch (err) {
      console.log(err);
    }
  });

  it("Should return In Progress jira status", async () => {
    const jiraStatus = "In Progress";

    try {
      const transition = await clientSingleton.getNextTransitionId(
        "TEST-1",
        jiraStatus
      );

      expect(transition.name).toEqual(jiraStatus);
    } catch (err) {
      console.log(err);
    }
  });

  it("Should transition task on jira board", async () => {
    try {
      const nextState = await clientSingleton.postJiraTransition(
        "TEST-1",
        "31"
      );

      expect(nextState.status).toEqual(204);
    } catch (err) {
      console.log(err);
    }
  });
});
