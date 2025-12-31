// eslint.config.js - Enhanced rules
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Performance rules
      "react/no-unstable-nested-components": "warn",
      "react/jsx-no-constructed-context-values": "warn",
      "react-hooks/exhaustive-deps": "error",
      
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      
      // Best practices
      "@next/next/no-img-element": "error",
      "react/self-closing-comp": ["error", {
        "component": true,
        "html": true
      }],
      "react/jsx-curly-brace-presence": ["error", {
        "props": "never",
        "children": "never"
      }],
      
      // Memory leak prevention
      "react-hooks/rules-of-hooks": "error",
      "react/jsx-no-useless-fragment": "warn",
      
      // Bundle size optimization
      "import/no-unused-modules": ["warn", { "unusedExports": true }],
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["lodash"],
              "message": "Use named imports from lodash for better tree shaking: import { debounce } from 'lodash/debounce'"
            }
          ]
        }
      ]
    },
  },
  // Performance-specific overrides
  {
    files: ["**/components/**/*.tsx", "**/hooks/**/*.ts"],
    rules: {
      "react/jsx-no-bind": ["warn", {
        "allowArrowFunctions": true,
        "allowBind": false,
        "ignoreDOMComponents": true
      }],
      "react/no-array-index-key": "error",
    }
  },
  // Gallery page specific optimizations
  {
    files: ["**/gallery/**/*.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": ["error", {
        "additionalHooks": "(useGallery|useImageUpload)"
      }]
    }
  }
];

export default eslintConfig;