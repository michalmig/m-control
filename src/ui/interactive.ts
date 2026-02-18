import prompts from 'prompts';
import { commandGroups } from '../commands';
import { configExists, initConfig, getConfigPath } from '../core/config';

/**
 * Run interactive mode with TUI
 */
export async function runInteractive(): Promise<void> {
  // Check config on first run
  if (!configExists()) {
    console.log('⚙️  First time setup - initializing configuration...\n');
    initConfig();
    console.log('✅ Configuration initialized!');
    console.log(`📁 Config location: ${getConfigPath()}\n`);
    console.log('Please fill in your credentials in the config file.');
    console.log('Run mctl again when ready.\n');
    return;
  }

  // Group selection
  const groupResponse = await prompts({
    type: 'select',
    name: 'group',
    message: 'Select category:',
    choices: commandGroups.map((g) => ({
      title: g.name,
      value: g.name,
    })),
  });

  if (!groupResponse.group) {
    console.log('Cancelled.');
    return;
  }

  const selectedGroup = commandGroups.find(
    (g) => g.name === groupResponse.group
  );

  if (!selectedGroup) {
    console.error('Group not found.');
    return;
  }

  // Command selection
  const commandResponse = await prompts({
    type: 'select',
    name: 'command',
    message: 'Select command:',
    choices: selectedGroup.commands.map((c) => ({
      title: c.name,
      description: c.description,
      value: c.id,
    })),
  });

  if (!commandResponse.command) {
    console.log('Cancelled.');
    return;
  }

  // Execute command
  const command = selectedGroup.commands.find(
    (c) => c.id === commandResponse.command
  );

  if (!command) {
    console.error('Command not found.');
    return;
  }

  try {
    await command.handler();
  } catch (error) {
    console.error('Error executing command:', error);
    process.exit(1);
  }
}
