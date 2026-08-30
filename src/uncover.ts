import { App, type Command, type KeymapInfo } from 'obsidian';

export class AppExtension extends App {
	declare commands: {
		commands: CommandMap;
	};
	declare hotkeyManager: { defaultKeys: { [key: string]: KeymapInfo[] } };
}

type CommandMap = {
	[key: string]: Command;
};
