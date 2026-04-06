module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-unused-vars": ["warn"],
    "no-console": "off",
    "eqeqeq": "error",
    "curly": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-var": "error",
    "prefer-const": "error",
    "no-eval": "error",
    "no-implied-eval": "error"
  },
};