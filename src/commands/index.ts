import { CommandGroup } from '../core/types';
import { helloWorld } from './misc/hello-world';

/**
 * Command registry
 * All available commands organized by category
 */
export const commandGroups: CommandGroup[] = [
  {
    name: 'Misc',
    commands: [
      {
        id: 'hello-world',
        name: 'Hello World',
        description: 'Print "Hello World!" to the console',
        handler: helloWorld,
      },
    ],
  },
];

/**
 * Find command by ID across all groups
 */
export function findCommand(commandId: string) {
  for (const group of commandGroups) {
    const command = group.commands.find((cmd) => cmd.id === commandId);
    if (command) {
      return command;
    }
  }
  return null;
}

/**
 * Get all command IDs (for help/autocomplete)
 */
export function getAllCommandIds(): string[] {
  return commandGroups.flatMap((group) => group.commands.map((cmd) => cmd.id));
}
