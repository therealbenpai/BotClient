import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import TSParser from '@typescript-eslint/parser'
import jsDoc from 'eslint-plugin-jsdoc'

const configs = {
  files: [
    'src/**/*.ts'
  ],
  languageOptions: {
    ecmaVersion: 6,
    globals: globals.node,
    sourceType: 'module',
    parser: TSParser,
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname
    }
  },
  plugins: {
    jsdoc: jsDoc,
    ts: tsPlugin
  },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'arrow-spacing': 'error',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    camelcase: 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'consistent-return': 'error',
    curly: ['error', 'multi-or-nest'],
    'eol-last': 'error',
    eqeqeq: 'error',
    'func-call-spacing': 'error',
    indent: ['error', 'tab'],
    'jsdoc/check-values': 'error',
    'jsdoc/require-description': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': 'error',
    'no-console': 'error',
    'prefer-const': 'error',
    'ts/adjacent-overload-signatures': 'error',
    'ts/array-type': 'error',
    'ts/await-thenable': 'error',
    'ts/class-literal-property-style': 'error',
    'ts/consistent-generic-constructors': 'error',
    'ts/consistent-indexed-object-style': 'error',
    'ts/consistent-type-assertions': 'error',
    'ts/consistent-type-definitions': 'error',
    'ts/no-array-constructor': 'error',
    'ts/no-base-to-string': 'error',
    'ts/no-confusing-non-null-assertion': 'error',
    'ts/no-duplicate-enum-values': 'error',
    'ts/no-duplicate-type-constituents': 'error',
    'ts/no-extra-non-null-assertion': 'error',
    'ts/no-floating-promises': 'error',
    'ts/no-implied-eval': 'error',
    'ts/no-inferrable-types': 'error',
    'ts/no-loss-of-precision': 'error',
    'ts/no-misused-new': 'error',
    'ts/no-misused-promises': 'error',
    'ts/no-non-null-asserted-optional-chain': 'error',
    'ts/no-redundant-type-constituents': 'error',
    'ts/no-this-alias': 'error',
    'ts/no-unnecessary-type-assertion': 'error',
    'ts/no-unnecessary-type-constraint': 'error',
    'ts/no-unsafe-assignment': 'error',
    'ts/no-unsafe-call': 'error',
    'ts/no-unsafe-declaration-merging': 'error',
    'ts/no-unsafe-enum-comparison': 'error',
    'ts/no-unsafe-member-access': 'error',
    'ts/no-var-requires': 'error',
    'ts/non-nullable-type-assertion-style': 'error',
    'ts/prefer-as-const': 'error',
    'ts/prefer-for-of': 'error',
    'ts/prefer-function-type': 'error',
    'ts/prefer-namespace-keyword': 'error',
    'ts/prefer-nullish-coalescing': 'error',
    'ts/prefer-optional-chain': 'error',
    'ts/prefer-string-starts-ends-with': 'error',
    'ts/require-await': 'error',
    'ts/restrict-plus-operands': 'error',
    'ts/restrict-template-expressions': 'error',
    'ts/triple-slash-reference': 'error',
    'ts/unbound-method': 'error'
  }
}

export default [configs]
