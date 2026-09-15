// @ts-check
import { defineConfig } from 'eslint/config'
import { cwd } from 'node:process'
import tseslint from 'typescript-eslint'

/**
 * TypeScript ライブラリパッケージ向けの基本 ESLint 設定
 *
 * 使い方 (eslint.config.js):
 *   import { baseConfig } from '@repo/eslint-config'
 *   export default baseConfig
 */
export const baseConfig = defineConfig(
  tseslint.configs.recommended,
  {
    rules: {
      // 未使用変数を禁止（アンダースコアプレフィックスは許可）
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // any 型の使用を警告
      '@typescript-eslint/no-explicit-any': 'warn',
      // 型インポートに type 修飾子を強制
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // var を禁止（let/const を使用）
      'no-var': 'error',
      // const を優先
      'prefer-const': 'error',
      // console.log を警告（warn/error/info は許可）
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    // no-deprecated など型情報が必要なルールは、tsconfig の管理下にある
    // src 配下のみに適用する。baseConfig はリポジトリルートの eslint.config.js
    // からも使われており、ルート直下には対応する tsconfig.json を持たない
    // スクリプト類が置かれうるため、typed linting をファイル全体に広げると
    // parsing error になってしまう。
    //
    // 注意: この files パターンと tsconfigRootDir はどちらも「eslint を
    // どこから起動したか」に依存する。files は読み込み側の eslint.config.js が
    // あるディレクトリ基準、tsconfigRootDir は実行時の cwd 基準なので、
    // 両者が一致する `pnpm -r lint` / `pnpm -r lint:fix` 経由で実行すること。
    // リポジトリルートから `eslint packages/math/src` のように直接叩くと
    // files が一致せず、no-deprecated がエラーも出さずに無効化される。
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        // tsconfigRootDir はこの共通設定を import する側(各パッケージ)のルートになるよう
        // import.meta.dirname ではなく実行時の cwd を使う
        projectService: {
          allowDefaultProject: ['*.config.{js,ts,mjs,mts}', 'vitest.setup.ts'],
        },
        tsconfigRootDir: cwd(),
      },
    },
    rules: {
      // @deprecated としてマークされた API の利用を検出
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
)
