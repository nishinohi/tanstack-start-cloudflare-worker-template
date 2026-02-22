import { exec, execSync } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Read stdin (required for hooks)
async function readInput() {
  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString())
}

// Get modified files using git
function getModifiedFiles() {
  try {
    // Get both staged and unstaged changes
    const staged = execSync('git diff --cached --name-only', {
      stdio: 'pipe',
      encoding: 'utf8',
    }).trim()

    const unstaged = execSync('git diff --name-only', {
      stdio: 'pipe',
      encoding: 'utf8',
    }).trim()

    const files = [...new Set([...staged.split('\n'), ...unstaged.split('\n')])]
      .filter((f) => f.length > 0)

    return files
  } catch {
    return []
  }
}

async function runTypeCheck() {
  try {
    await execAsync('pnpm typecheck', { encoding: 'utf8' })
    return null
  } catch (error) {
    return error.stdout || error.stderr || error.message
  }
}

async function runESLintCheck(files) {
  if (files.length === 0) {
    return null
  }
  try {
    // ファイルパスをシェルセーフにエスケープ
    const fileArgs = files.map((f) => `"${f}"`).join(' ')
    await execAsync(`pnpm eslint ${fileArgs}`, { encoding: 'utf8' })
    return null
  } catch (error) {
    return error.stdout || error.stderr || error.message
  }
}

async function main() {
  try {
    await readInput() // Consume stdin (required)

    const modifiedFiles = getModifiedFiles()

    // Check if any JS/TS files were modified
    const jstsFiles = modifiedFiles.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f))
    if (jstsFiles.length === 0) {
      process.exit(0)
    }

    const hasTypeScriptFiles = jstsFiles.some((f) => /\.(ts|tsx)$/.test(f))

    // Run type check and ESLint check in parallel
    const checks = [runESLintCheck(jstsFiles)]
    if (hasTypeScriptFiles) {
      checks.push(runTypeCheck())
    }

    const results = await Promise.all(checks)
    const errors = results.filter((error) => error !== null)

    if (errors.length > 0) {
      console.error(errors.join('\n\n'))
      process.exit(2)
    }
  } catch (error) {
    console.error(`Hook error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(`Hook error: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
