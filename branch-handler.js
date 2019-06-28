require("dotenv").config();
const { clientSingleton } = require("./client");

const { GITHUB_BRANCH_OPEN } = process.env;

const branchRequestHook = bodyPayload => {
  // Fallback parsing
  if (typeof bodyPayload === "string") {
    console.log("Parsing body payload since it is a string");
    bodyPayload = JSON.parse(bodyPayload);
  }

  const { ref, ref_type } = bodyPayload;

  if (ref_type !== "branch") {
    return Promise.resolve({
      status: 500,
      message: "Not a branch event"
    });
  }

  return clientSingleton
    .getNextTransitionId(ref, GITHUB_BRANCH_OPEN)
    .then(transition => {
      if (!transition) {
        console.error("No transition found: " + JSON.stringify(transition));

        return {
          status: 500,
          message: "No transition found"
        };
      }

      return clientSingleton.postJiraTransition(ref, transition.id);
    })
    .then(() => {
      console.log("Successfully transitioned Jira task");

      return {
        status: 200,
        message: "Successfully transitioned Jira task"
      };
    })
    .catch(err => {
      console.log("Error: " + JSON.stringify(err));

      return {
        status: 500,
        message: JSON.stringify(err)
      };
    });
};

module.exports = {
  branchRequestHook
};
