import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        ignores: ["dist/**"]
    },
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        plugins: {js},
        extends: ["js/recommended"],
        languageOptions: {globals: globals.browser}
    },
    pluginReact.configs.flat.recommended,

    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        settings: { react: { version: "detect" } },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off"
        }
    }
]);
