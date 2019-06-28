require("dotenv").config();

jest.mock("./client");

const { clientSingleton } = require("./client");
const { branchRequestHook } = require("./branch-handler");

const { GITHUB_BRANCH_OPEN } = process.env;

describe("pr-handler", () => {
  it("Should call the right functions to move the ticket", async () => {
    clientSingleton.getNextTransitionId.mockReturnValue(
      Promise.resolve({ id: "20" })
    );

    const bodyPayload = {
      ref: "test",
      ref_type: "branch"
    };

    await branchRequestHook(bodyPayload);

    expect(clientSingleton.getNextTransitionId).toHaveBeenCalledWith(
      "test",
      GITHUB_BRANCH_OPEN
    );

    expect(clientSingleton.postJiraTransition).toHaveBeenCalledWith(
      "test",
      "20"
    );
  });
});
