import { App, type Command, type KeymapInfo } from 'obsidian';

export class AppExtension extends App {
	commands: {
		commands: CommandMap;
	};
	hotkeyManager: { defaultKeys: { [key: string]: KeymapInfo[] } };
}

type CommandMap = {
	[key: string]: Command;
};
