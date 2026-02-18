import { runInteractive } from './ui/interactive';
import { findCommand, getAllCommandIds } from './commands';

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
m-control - Michał's Personal Command Center

Usage:
  mctl                  Launch interactive mode
  mm                    Launch interactive mode (alias)
  mctl <command>        Execute command directly
  mctl --help           Show this help message

Available commands:
${getAllCommandIds()
  .map((id) => `  - ${id}`)
  .join('\n')}

Examples:
  mctl                  # Interactive mode
  mctl hello-world      # Direct execution

Configuration:
  Config is stored in ~/.m-control/config.json
  Run 'mctl' without arguments to initialize on first use.
  `);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // No args - interactive mode
  if (args.length === 0) {
    await runInteractive();
    return;
  }

  // Help flag
  if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  // Direct command execution
  const commandId = args[0];
  const command = findCommand(commandId);

  if (!command) {
    console.error(`❌ Unknown command: ${commandId}`);
    console.log(`Run 'mctl --help' for available commands.\n`);
    process.exit(1);
  }

  try {
    await command.handler();
  } catch (error) {
    console.error('❌ Error executing command:', error);
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
