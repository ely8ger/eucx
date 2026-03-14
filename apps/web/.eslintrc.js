/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@eucx/config/eslint/nextjs"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
