import { App, normalizePath, Notice, TFile, TFolder, moment } from 'obsidian';

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
}
