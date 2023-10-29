import * as vscode from 'vscode';

export default class NoteContentProvider implements vscode.TextDocumentContentProvider {
  onDidChange?: vscode.Event<vscode.Uri> | undefined;

  provideTextDocumentContent(uri: vscode.Uri): string {
    const noteContent = decodeURIComponent(uri.query);
    return noteContent;
  }
}
