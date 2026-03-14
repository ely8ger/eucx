/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./eslint.base.js",
    "next/core-web-vitals",
    "next/typescript",
  ],
  rules: {
    // Next.js spezifisch
    "@next/next/no-html-link-for-pages": "error",
    "react/no-danger": "error",
    "react/jsx-no-script-url": "error",

    // XSS-Schutz
    "react/no-danger-with-children": "error",
  },
};
