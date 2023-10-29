import * as vscode from 'vscode';

export interface Note {
	id: string
	label: string
	value: string
	color?: string
}

export class NoteService {
	private notes: Note[] = [];

	constructor(private context: vscode.ExtensionContext) {
		this.notes = this.context.globalState.get('egNotes.notes', []);
	}


	// Helpers

	extractNoteId(fileName: string): string {
		const match = fileName.match(/(\d+)\.note$/);
		if (match && match[1]) {
			return match[1];
		}
		return "";
	}


	// Setters / Getters

	getNotes(): Note[] {
		return this.notes;
	}

	getNote(id?: string): Note | undefined {
		if (!id) return undefined;
		return this.notes.find(note => note.id === id);
	}

	async addNote(note: Note) {
		this.notes.unshift(note);
		await this.context.globalState.update('egNotes.notes', this.notes);
		return this.notes;
	}

	async cleanNotes() {
		this.notes = [];
		await this.context.globalState.update('egNotes.notes', []);
		return this.notes;
	}

	async removeNote(id: string) {
		this.notes = this.notes.filter(n => n.id !== id);
		await this.context.globalState.update('egNotes.notes', this.notes);
		return this.notes;
	}

	async updateNote(note: Note) {
		const index = this.notes.findIndex(n => n.id === note.id);
		if (index >= 0) {
			this.notes[index] = note;
			await this.context.globalState.update('egNotes.notes', this.notes);
		}
		return this.notes;
	}

	async saveNote(id: string, value: string) {
		const index = this.notes.findIndex(n => n.id === id);
		if (index >= 0) {
			this.notes[index].value = value;
			await this.context.globalState.update('egNotes.notes', this.notes);
			return true;
		}
		return false;
	}

}
