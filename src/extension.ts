import * as vscode from 'vscode';
import NotesExplorerProvider, { NoteItem } from './NotesExplorerProvider';
import { NoteForm } from './NoteForm';
import { SearchForm } from './SearchForm';
import { NoteService } from './NoteService';
import SimpleFileSystemProvider from './SimpleFileSystemProvider';
import NoteContentProvider from './NoteContentProvider';


export function activate(context: vscode.ExtensionContext) {

	// Custom Document Provider
	const fileSystemProvider = new SimpleFileSystemProvider();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('note', fileSystemProvider, { isCaseSensitive: true }));

	const noteService = new NoteService(context);
	const provider = new NoteContentProvider();
	const registration = vscode.workspace.registerTextDocumentContentProvider('note', provider);
	context.subscriptions.push(registration);

	// Notes Explorer
	const notesExplorer = new NotesExplorerProvider(context);
	context.subscriptions.push(vscode.window.registerTreeDataProvider(NotesExplorerProvider.viewType, notesExplorer));

	function refreshAll() {
		notesExplorer.refresh();
	}

	// Commands

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.refreshEntry', () =>
		refreshAll()
	));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNote', async () => {
		const res = await new NoteForm().show();
		await noteService.addNote(res);
		refreshAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNoteFromSelection', async () => {
		const selection = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection);
		const res = await new NoteForm({ value: selection }).show();
		await noteService.addNote(res);
		refreshAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNoteFromClipboard', async () => {
		const value = await vscode.env.clipboard.readText();
		const res = await new NoteForm({ value: value }).show();
		await noteService.addNote(res);
		refreshAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.clearNotes', async () => {
		await noteService.cleanNotes();
		refreshAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.deleteNote', async (noteItem?: NoteItem) => {
		if (noteItem) {
			await noteService.removeNote(noteItem.id);
			refreshAll();
		}
		else {
			vscode.window.showInformationMessage('No note selected. Delete using the list view.');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.editNote', async (noteItem: NoteItem) => {
		const note = noteService.getNote(noteItem.id);
		if (note) {
			const res = await new NoteForm(note).show();
			noteService.updateNote(res);
			refreshAll();
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.copyNoteValue', async (noteItem?: NoteItem) => {
		if (noteItem) {
			const note = noteService.getNote(noteItem.id);
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
		refreshAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.searchNotesClear', async () => {
		await context.globalState.update('egNotes.query', "");
		refreshAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('egNotes.openNote', async (noteItem?: NoteItem) => {
		const note = noteService.getNote(noteItem?.id);

		// using default read-only editor
		/* if (note) {
			const noteTitle = note.label;
			const uri = vscode.Uri.parse(`note:${noteTitle}.note?${encodeURIComponent(note.value)}`);
			const doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc, { preview: true });
		} */

		// using the SimpleFileSystemProvider
		if (note) {
			const uri = vscode.Uri.parse(`note:/${note.id}.note`);
			await fileSystemProvider.writeFile(uri, new TextEncoder().encode(note.value), { create: true, overwrite: true });
			const doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	}));

	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async (doc: vscode.TextDocument) => {
		// Check if the document's URI scheme is 'note'
		if (doc.uri.scheme === 'note') {
			const content = doc.getText();
			const noteId = noteService.extractNoteId(doc.fileName);
			noteService.saveNote(noteId, content);
			refreshAll();
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
	}));

}
