import {
	App,
	normalizePath,
	Notice,
	TFile,
	TFolder,
	moment,
	Platform,
} from 'obsidian';

export class LocalFileInterfaceProvider {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	async import(folder: TFolder): Promise<void> {
		const inputEl = createEl('input', { type: 'file' });

		inputEl.multiple = true;
		inputEl.addEventListener('change', async () => {
			const files = inputEl.files;
			if (files === null || files.length === 0) {
				return;
			}
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file === undefined) {
					continue;
				}
				const filepath = normalizePath(`${folder.path}/${file.name}`);

				// check coincidence
				const prefixOnConflict =
					this.app.vault.getAbstractFileByPath(filepath) instanceof
					TFile
						? `CONFLICT_${moment().format('YYYY-MM-DD_HH-mm-ss')}_`
						: '';

				const filepathWithoutConflict = normalizePath(
					`${folder.path}/${prefixOnConflict}${file.name}`
				);

				try {
					await this.app.vault.createBinary(
						filepathWithoutConflict,
						await file.arrayBuffer()
					);
					new Notice(`${file.name} imported!`);
				} catch (err) {
					console.log(`ERROR in Local File Interface: ${err}`);
					new Notice(`Failed to import ${file.name}`);
				}
			}

			inputEl.remove();
		});
		inputEl.click();
	}

	async export(file: TFile): Promise<void> {
		if (Platform.isDesktopApp) {
			this.exportInDesktop(file);
		} else if (Platform.isMobileApp) {
			this.exportInMobile(file);
		} else {
			console.log(
				'ERROR in Local File Interface: unable to find platform type'
			);
		}
	}

	private async exportInDesktop(file: TFile): Promise<void> {
		const blob = new Blob([await this.app.vault.readBinary(file)]);
		const url = URL.createObjectURL(blob);
		const tmpDownloadEl = document.body.createEl('a', {
			href: url,
		});
		tmpDownloadEl.download = file.name;
		tmpDownloadEl.click();
		tmpDownloadEl.remove();
		URL.revokeObjectURL(url);
	}

	private exportInMobile(file: TFile) {
		(this.app as any).openWithDefaultApp(file.path);
	}
}
