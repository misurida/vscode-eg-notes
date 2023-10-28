import * as vscode from "vscode";


export class SearchForm {

	private query: string = '';
	private context: vscode.ExtensionContext;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.query = context.globalState.get('egNotes.query', "");
	}

	public async show() {
		return await this.inputQuery();
	}


	private async inputQuery() {
		const box = vscode.window.createInputBox();
		box.title = 'Search notes';
		box.value = this.query;
		box.placeholder = 'Search the notes...';
		box.onDidChangeValue((v) => {
			this.query = v;
			this.context.globalState.update('egNotes.query', v);
			vscode.commands.executeCommand('egNotes.refreshEntry');
		});
		return await new Promise<string | undefined>(resolve => {
			box.onDidAccept(() => {
				resolve(box.value);
				box.dispose();
			});
			box.show();
		});
	}


}