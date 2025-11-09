const defaultProjects = [
  "./tsconfig.json",
  "./apps/*/tsconfig.json",
  "./packages/*/tsconfig.json"
];

const projectEntries = process.env.KITGRID_TSCONFIG
  ? process.env.KITGRID_TSCONFIG.split(",").map((entry) => entry.trim()).filter(Boolean)
  : defaultProjects;

const tsParserOptions = {
  project: projectEntries,
  tsconfigRootDir: process.cwd(),
  extraFileExtensions: [".astro"],
  ecmaVersion: "latest",
  sourceType: "module"
};

const jsTsFiles = ["**/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}"];

module.exports = {
  root: true,
  ignorePatterns: [
    "dist",
    "build",
    "coverage",
    "node_modules",
    ".astro",
    "*.generated.*"
  ],
  settings: {
    "import/resolver": {
      node: true,
      typescript: {
        project: projectEntries
      }
    }
  },
  overrides: [
    {
      files: jsTsFiles,
      env: {
        browser: true,
        node: true,
        es2023: true
      },
      parser: "@typescript-eslint/parser",
      parserOptions: tsParserOptions,
      plugins: [
        "@typescript-eslint",
        "import",
        "jsx-a11y",
        "security",
        "unicorn",
        "unused-imports"
      ],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/recommended",
        "plugin:jsx-a11y/strict",
        "plugin:security/recommended",
        "plugin:unicorn/recommended"
      ],
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports", fixStyle: "inline-type-imports" }
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: { arguments: false } }
        ],
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "import/no-unresolved": "off",
        "import/order": [
          "error",
          {
            groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
            alphabetize: { order: "asc", caseInsensitive: true },
            "newlines-between": "always"
          }
        ],
        "import/newline-after-import": "error",
        "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }],
        "security/detect-object-injection": "off",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/filename-case": [
          "error",
          { cases: { camelCase: true, kebabCase: true, pascalCase: true } }
        ],
        "unicorn/no-null": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn",
          { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }
        ]
      }
    },
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        tsconfigRootDir: process.cwd()
      },
      extends: ["plugin:astro/recommended"],
      rules: {
        "astro/no-set-html-directive": "error"
      }
    },
    {
      files: ["**/*.mdx"],
      plugins: ["mdx", "jsx-a11y"],
      extends: [
        "plugin:mdx/recommended",
        "plugin:mdx/overrides",
        "plugin:mdx/code-blocks",
        "plugin:jsx-a11y/strict"
      ],
      rules: {
        "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }]
      }
    },
    {
      files: ["**/*.config.{js,cjs,mjs,ts}", "**/*rc.cjs", "**/*rc.js"],
      env: { node: true },
      parserOptions: {
        ...tsParserOptions,
        project: null
      },
      rules: {
        "unicorn/prefer-module": "off"
      }
    }
  ]
};
