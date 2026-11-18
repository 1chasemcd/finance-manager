import z from "zod";

z.config({
  customError: (issue) => {
    if (issue.code === "too_small" && issue.origin === "string") {
      if (issue.minimum === 1) return "Must not be empty";
      return `Must have at least ${issue.minimum.toString()} characters`;
    }

    if (issue.code === "too_big" && issue.origin === "string") {
      return `Must have at most ${issue.maximum.toString()} character${issue.maximum === 1 ? "" : "s"}`;
    }

    return undefined;
  },
});
