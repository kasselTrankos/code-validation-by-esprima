module.exports = {
    "env": {
        "browser": true
    },
    "globals": {
        "angular": 1,
        "CNT":1
    },
    "formatters":"html",
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
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