module.exports = {
    "env": {
      "node": true
    },
    "extends": "standard",
    "plugins": [
        "standard",
        "promise"
    ],
    "rules": {
      "semi": ["error", "always"],
      "no-multiple-empty-lines": ["error", {"max": 2}]
    }
};
