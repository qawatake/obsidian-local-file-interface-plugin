import {
	App,
	normalizePath,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from 'obsidian';
import { AppExtension } from './uncover';
import { FolderSuggest } from 'suggesters/FolderSuggester';

// Remember to rename these classes and interfaces!

interface LocalFileInterfacePluginSettings {
	folder: string;
}

const DEFAULT_SETTINGS: LocalFileInterfacePluginSettings = {
	folder: '/',
};

export default class LocalFileInterfacePlugin extends Plugin {
	settings: LocalFileInterfacePluginSettings;
	fileInputEl: HTMLInputElement;

	async onload() {
		console.log(this.app);
		await this.loadSettings();

		this.fileInputEl = document.body.appendChild(
			createEl('input', { type: 'file' })
		);
		this.fileInputEl.style.display = 'none';
		this.fileInputEl.multiple = true;
		this.fileInputEl.addEventListener('change', async () => {
			const files = this.fileInputEl.files;
			if (files === null || files.length === 0) {
				return;
			}
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file === undefined) {
					continue;
				}
				const filepath = normalizePath(
					`${this.settings.folder}/${file.name}`
				);
				console.log(file.name);
				this.app.vault.createBinary(filepath, await file.arrayBuffer());
			}
		});

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon(
		// 	'dice',
		// 	'Sample Plugin',
		// 	(evt: MouseEvent) => {
		// 		// Called when the user clicks the icon.
		// 		const app = this.app as AppExtension;
		// 		console.log('a');
		// 		console.log(app);
		// 		console.log(app.commands.commands);
		// 		new Notice('This is a notice!');
		// 	}
		// );
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'local-file-interface-import',
			name: 'Import local files',
			callback: () => {
				this.fileInputEl.click();
			},
		});
		this.addCommand({
			id: 'local-file-interface-export',
			name: 'Export current file',
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile === null) {
					return null;
				}
				const blob = new Blob([
					await this.app.vault.readBinary(activeFile),
				]);
				const url = URL.createObjectURL(blob);
				const tmpDownloadEl = document.body.createEl('a', {
					href: url,
				});
				tmpDownloadEl.download = activeFile.name;
				tmpDownloadEl.click();
				tmpDownloadEl.remove();
				URL.revokeObjectURL(url);
			},
		});
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	},
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	},
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView =
		// 			this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(
			new LocalFileInterfacePluginSettingTab(this.app, this)
		);

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000)
		// );
	}

	override onunload() {
		document.removeChild(this.fileInputEl);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// async waitUntilCommandsFound(): Promise<Command> {
	// 	const app = this.app as AppExtension;
	// 	for (let i = 0; i < 100; i++) {
	// 		const command = app.commands.commands['command-palette:open'];
	// 		if (command) {
	// 			console.log(i);
	// 			return command;
	// 		}
	// 		await new Promise((s) => {
	// 			setTimeout(s, 1);
	// 		});
	// 	}
	// 	return Promise.reject('timeout: failed to load commands');
	// }
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	override onOpen() {
// 		const { contentEl } = this;
// 		contentEl.setText('Woah!');
// 	}

// 	override onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }

class LocalFileInterfacePluginSettingTab extends PluginSettingTab {
	plugin: LocalFileInterfacePlugin;

	constructor(app: App, plugin: LocalFileInterfacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Default location for imported items')
			.addSearch((component) => {
				new FolderSuggest(this.app, component.inputEl);
				component
					.setPlaceholder('Example: folder1/folder2')
					.setValue(this.plugin.settings.folder)
					.onChange((newFolder) => {
						this.plugin.settings.folder = newFolder;
						this.plugin.saveSettings();
					});
			});
		// .setDesc("It's a secret")
		// .addText((text) =>
		// 	text
		// 		.setPlaceholder('Enter your secret')
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			console.log('Secret: ' + value);
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		})
		// );
	}
}

// class ExampleModal extends FuzzySuggestModal<string> {
// 	getItems(): string[] {
// 		return ['a', 'b', 'c'];
// 	}

// 	getItemText(book: Book): string {
// 		return book.title;
// 	}

// 	onChooseItem(book: Book, evt: MouseEvent | KeyboardEvent) {
// 		new Notice(`Selected ${book.title}`);
// 	}
// }
