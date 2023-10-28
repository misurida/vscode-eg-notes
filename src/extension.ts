import * as vscode from 'vscode';
import NotesExplorer, { NoteItem } from './NotesExplorer';
import { NoteForm } from './NoteForm';
import { SearchForm } from './SearchForm';
import NotesViewProvider from './NotesView';

export interface Note {
	id: string
	label: string
	value: string
	color?: string
}

export function activate(context: vscode.ExtensionContext) {

	// Notes View
	const notesView = new NotesViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(NotesViewProvider.viewType, notesView));

	// Notes Explorer
	const notesExplorer = new NotesExplorer(context);
	context.subscriptions.push(vscode.window.registerTreeDataProvider(NotesExplorer.viewType, notesExplorer));
	context.subscriptions.push(vscode.commands.registerCommand('egNotes.refreshEntry', () =>
		notesExplorer.refresh()
	));

	// Commands

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNote', async () => {
		const res = await new NoteForm().show();
		await context.globalState.update('egNotes.notes', [res, ...context.globalState.get('egNotes.notes', [])]);
		notesExplorer.refresh();
		//notesView.addNote(res);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNoteFromSelection', async () => {
		const selection = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection);
		const res = await new NoteForm({ value: selection }).show();
		await context.globalState.update('egNotes.notes', [res, ...context.globalState.get('egNotes.notes', [])]);
		notesExplorer.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNoteFromClipboard', async () => {
		const value = await vscode.env.clipboard.readText();
		const res = await new NoteForm({ value: value }).show();
		await context.globalState.update('egNotes.notes', [res, ...context.globalState.get('egNotes.notes', [])]);
		notesExplorer.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.clearNotes', async () => {
		await context.globalState.update('egNotes.notes', []);
		notesExplorer.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.deleteNote', async (noteItem?: NoteItem) => {
		if (noteItem) {
			await context.globalState.update('egNotes.notes', context.globalState.get('egNotes.notes', []).filter((n: Note) => n.id !== noteItem.id));
			notesExplorer.refresh();
		}
		else {
			vscode.window.showInformationMessage('No note selected. Delete using the list view.');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.editNote', async (noteItem: NoteItem) => {
		const notes: Note[] = context.globalState.get('egNotes.notes', []);
		const noteIndex = notes.findIndex((n: Note) => n.id === noteItem.id);
		if (noteIndex >= 0) {
			const res = await new NoteForm(notes[noteIndex]).show();
			notes.splice(noteIndex, 1, res);
			await context.globalState.update('egNotes.notes', notes);
			notesExplorer.refresh();
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.copyNoteValue', async (noteItem?: NoteItem) => {
		if (noteItem) {
			const notes: Note[] = context.globalState.get('egNotes.notes', []);
			const note = notes.find((n: Note) => n.id === noteItem.id);
			if (note) {
				vscode.env.clipboard.writeText(note.value);
			}
			else {
				vscode.window.showInformationMessage('No note found.');
			}
		}
		else {
			vscode.window.showInformationMessage('No note selected. Copy using the list view.');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.searchNotes', async () => {
		const value = await new SearchForm(context).show();
		await context.globalState.update('egNotes.query', value);
		notesExplorer.refresh();
		//notesView.addNote(res);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.searchNotesClear', async () => {
		await context.globalState.update('egNotes.query', "");
		notesExplorer.refresh();
	}));

	/* // Node Dependencies
	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath
		: undefined;

	if (rootPath) {
		const notesExplorerProvider = new NotesExplorer(rootPath);
		context.subscriptions.push(vscode.window.registerTreeDataProvider(NotesExplorer.viewType, notesExplorerProvider));
		context.subscriptions.push(vscode.window.createTreeView(NotesExplorer.viewType, {
			treeDataProvider: notesExplorerProvider
		}));
		context.subscriptions.push(vscode.commands.registerCommand('egNotes.refreshEntry', () =>
			notesExplorerProvider.refresh()
		));
	} */



}

