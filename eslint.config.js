// @ts-check
import { baseConfig } from './packages/eslint-config/src/index.js'
import { defineConfig } from 'eslint/config'

/**
 * リポジトリ直下のスクリプト・設定ファイル専用の ESLint 設定。
 *
 * flat config は入れ子の eslint.config.js を自動探索しないため、
 * ここで apps/ と packages/ を無視しないと、各パッケージが自前の設定
 * （apps/web なら tanstackConfig ベースの厳格な設定）で lint されるべき
 * ファイルを baseConfig のルールで二重に lint してしまう。
 * とくに `eslint --fix` を root で回すと、別ルールセットでの自動修正が
 * apps/web のソースに入り込む。
 *
 * 各パッケージの lint は `pnpm -r lint` / `pnpm -r lint:fix` が
 * それぞれの eslint.config.js を使って実行する。
 */
export default defineConfig([{ ignores: ['apps/**', 'packages/**'] }, ...baseConfig])
