/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

import {defineConfig} from 'eslint/config'
import path from 'path'
import {fileURLToPath} from 'url'
import js from '@eslint/js'
import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'
import stylistic from '@stylistic/eslint-plugin'
import {FlatCompat} from '@eslint/eslintrc'

const filename = fileURLToPath(import.meta.url)
const directory = path.dirname(filename)
const compat = new FlatCompat({
  baseDirectory: directory,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  {ignores: ['eslint.config.mjs', 'client/**']},
  js.configs.recommended,
  ...compat.extends('google'),
  jsdoc.configs['flat/recommended-error'],
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {...globals.node},
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    settings: {
      jsdoc: {tagNamePreference: {returns: 'return'}},
    },
    plugins: {'@stylistic': stylistic},
    rules: {
      'valid-jsdoc': 'off',
      'require-jsdoc': 'off',
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'indent': ['error', 2],
      'camelcase': ['error', {properties: 'never'}],
      'max-len': ['error', {
        code: 80,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      'jsdoc/no-undefined-types': [
        'error',
        {definedTypes: ['TextDocument', 'Buffer']},
      ],
      'jsdoc/reject-any-type': 'off',
      '@stylistic/space-infix-ops': 'error',
      'id-length': ['error', {min: 2}],
      'no-restricted-syntax': ['error', {
        selector: 'UpdateExpression[prefix=true]',
        message: 'Use postfix increment/decrement (x++), not prefix (++x)',
      }],
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'jsdoc/require-jsdoc': ['error', {
        require: {FunctionDeclaration: true, FunctionExpression: true},
      }],
    },
  },
])
