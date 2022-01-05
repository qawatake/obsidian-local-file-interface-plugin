import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Menu,
	TFile,
	TFolder,
	MenuItem,
} from 'obsidian';
import { FolderSuggest } from 'suggesters/FolderSuggester';
import { LocalFileInterfaceProvider } from 'FileInterface';

// Remember to rename these classes and interfaces!

interface LocalFileInterfacePluginSettings {
	folder: string;
}

const DEFAULT_SETTINGS: LocalFileInterfacePluginSettings = {
	folder: '/',
};

export default class LocalFileInterfacePlugin extends Plugin {
	settings: LocalFileInterfacePluginSettings;
	fileInterfaceProvider: LocalFileInterfaceProvider;

	async onload() {
		console.log(this.app);
		await this.loadSettings();
		this.fileInterfaceProvider = new LocalFileInterfaceProvider(this.app);

		// file menu: Import file here
		this.registerEvent(
			this.app.workspace.on(
				'file-menu',
				(menu: Menu, abstractFile: TFile) => {
					if (!(abstractFile instanceof TFolder)) {
						return;
					}

					const folder = abstractFile;
					menu.addItem((item: MenuItem) => {
						item.setIcon('file-explorer-glyph')
							.setTitle('Import local files here')
							.onClick(() => {
								this.fileInterfaceProvider.import(folder);
							});
					});
				}
			)
		);

		// file memu: Export current file
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
				if (!(file instanceof TFile)) {
					return;
				}
				menu.addItem((item: MenuItem) => {
					item.setIcon('file-explorer-glyph')
						.setTitle('Export out of the vault')
						.onClick(() => {
							this.fileInterfaceProvider.export(file);
						});
				});
			})
		);

		// commands
		this.addCommand({
			id: 'local-file-interface-import',
			name: 'Import local files',
			callback: () => {
				const folder = this.app.vault.getAbstractFileByPath(
					this.settings.folder
				);
				if (!(folder instanceof TFolder)) {
					const errMsg = `ERROR in Local Folder Interface: ${this.settings.folder} is not a folder`;
					console.log(errMsg);
					new Notice(
						`ERROR in Local Folder Interface: ${this.settings.folder} is not a folder`
					);
					return;
				}
				this.fileInterfaceProvider.import(folder);
			},
		});

		this.addCommand({
			id: 'local-file-interface-export',
			name: 'Export the current file',
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile === null) {
					return;
				}

				await this.fileInterfaceProvider.export(activeFile);
			},
		});

		this.addSettingTab(
			new LocalFileInterfacePluginSettingTab(this.app, this)
		);
	}

	// onunload() {}

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
}

class LocalFileInterfacePluginSettingTab extends PluginSettingTab {
	plugin: LocalFileInterfacePlugin;

	constructor(app: App, plugin: LocalFileInterfacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

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
	}
}
