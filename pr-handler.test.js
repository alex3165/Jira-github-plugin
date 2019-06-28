require("dotenv").config();

jest.mock("./client");

const { clientSingleton } = require("./client");
const { pullRequestHook } = require("./pr-handler");

const { GITHUB_PR_OPEN } = process.env;

describe("pr-handler", () => {
  it("Should call the right functions to move the ticket", async () => {
    clientSingleton.getNextTransitionId.mockReturnValue(
      Promise.resolve({ id: "31" })
    );

    const bodyPayload = {
      action: "opened",
      pull_request: {
        head: {
          ref: "test"
        }
      }
    };

    await pullRequestHook(bodyPayload);

    expect(clientSingleton.getNextTransitionId).toHaveBeenCalledWith(
      "test",
      GITHUB_PR_OPEN
    );

    expect(clientSingleton.postJiraTransition).toHaveBeenCalledWith(
      "test",
      "31"
    );
  });
});
