import { QuickInputButtons, window } from "vscode";
import { Note } from "./NoteService";


export class NoteForm {

	private note: Note = {
		id: '',
		label: '',
		value: ''
	};

	constructor(note?: Partial<Note>, private onlyLabel?: boolean) {
		if (note?.label) this.note.label = note.label;
		if (note?.value) this.note.value = note.value;
		if (note?.id) this.note.id = note.id;
	}

	public async show() {
		if (this.onlyLabel) {
			await this.inputLabel();
			return {
				...this.note,
				id: this.note.id || new Date().getTime().toString(),
			};
		}
		else if ((!this.note.value || !!this.note.id)) {
			await this.inputNote(1, 2);
		}
		await this.inputLabel(2, 2);
		return {
			...this.note,
			id: new Date().getTime().toString(),
		};
	}

	private async inputLabel(step?: number, maxStep?: number) {
		const box = window.createInputBox();
		box.title = 'Note label';
		box.value = this.note.label;
		box.placeholder = 'Note label...';
		box.prompt = 'Optional: Enter the note label';
		box.step = step;
		box.totalSteps = maxStep;
		box.onDidTriggerButton(button => {
			if (button === QuickInputButtons.Back) {
				box.dispose();
			}
		});
		const v = await new Promise<string | undefined>(resolve => {
			box.onDidAccept(() => {
				resolve(box.value);
				box.dispose();
			});
			box.show();
		});
		if (v) {
			this.note.label = v;
		}
	}

	private async inputNote(step: number, maxStep: number) {
		const box = window.createInputBox();
		box.title = 'New note';
		box.value = this.note.value;
		box.placeholder = 'Note...';
		box.prompt = 'Enter your note';
		box.step = step;
		box.totalSteps = maxStep;
		box.onDidTriggerButton(button => {
			if (button === QuickInputButtons.Back) {
				box.dispose();
			}
		});
		const v = await new Promise<string | undefined>(resolve => {
			box.onDidAccept(() => {
				if (!box.value) {
					box.validationMessage = 'Note cannot be empty';
					return;
				}
				resolve(box.value);
				box.dispose();
			});
			box.show();
		});
		if (v) {
			this.note.value = v;
		}
	}

}