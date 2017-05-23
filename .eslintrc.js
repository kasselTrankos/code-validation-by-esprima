module.exports = {
    "env": {
        "browser": true
    },
    "globals": {
        "angular": 1,
        "CNT":1
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "eqeqeq": ["error", "always"],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};