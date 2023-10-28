import * as vscode from 'vscode';
import NotesExplorer from './NotesExplorer';
import NotesViewProvider from './NotesViewProvider';

export function activate(context: vscode.ExtensionContext) {

	const notesViewProvider = new NotesViewProvider(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(NotesViewProvider.viewType, notesViewProvider));
	context.subscriptions.push(vscode.commands.registerCommand('egNotes.addNote', () => {
		notesViewProvider.addNote();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('egNotes.clearNotes', () => {
		notesViewProvider.clearNotes();
	}));


	// Notes Explorer

	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath
		: undefined;

	if (rootPath) {
		const notesExplorerProvider = new NotesExplorer(rootPath);
		context.subscriptions.push(vscode.window.registerTreeDataProvider(NotesExplorer.viewType, notesExplorerProvider));
		context.subscriptions.push(vscode.commands.registerCommand('egNotes.refreshEntry', () =>
			notesExplorerProvider.refresh()
		));
		context.subscriptions.push(vscode.window.registerTreeDataProvider(NotesExplorer.viewType, new NotesExplorer(rootPath)));
		context.subscriptions.push(vscode.window.createTreeView(NotesExplorer.viewType, {
			treeDataProvider: new NotesExplorer(rootPath)
		}));


	}

}

