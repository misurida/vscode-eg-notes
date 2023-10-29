import * as vscode from 'vscode';
import { Note } from './NoteService';

export default class NotesExplorerProvider implements vscode.TreeDataProvider<NoteItem> {

  public static readonly viewType = 'egNotes.notesExplorer';

  private _onDidChangeTreeData: vscode.EventEmitter<NoteItem | undefined | void> = new vscode.EventEmitter<NoteItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<NoteItem | undefined | void> = this._onDidChangeTreeData.event;
  private readonly _extensionContext: vscode.ExtensionContext;

  constructor(extensionContext: vscode.ExtensionContext) {
    this._extensionContext = extensionContext;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: NoteItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: NoteItem): Thenable<NoteItem[]> {
    if (element) {
      return Promise.resolve([]);
    }
    else {
      const notesList = this._extensionContext.globalState.get('egNotes.notes', []);
      const q = this._extensionContext.globalState.get('egNotes.query', "");
      const notes = q ? notesList.filter((n: Note) => n.value.includes(q)) : notesList;
      if (notes.length === 0 && q) {
        return Promise.resolve([new NoteItem(
          "No notes found...",
          `"${q}"`,
          "placeholder",
          vscode.TreeItemCollapsibleState.None
        )]);
      }
      return Promise.resolve(notes.map((note: Note, index: number) => new NoteItem(
        note.label,
        note.value,
        note.id,
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'egNotes.openNote',
          title: 'Edit note',
          arguments: [note, index]
        }
      )));
    }
  }

}

export class NoteItem extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    private readonly value: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = this.value;
    this.description = this.value;
    // this.iconPath = vscode.ThemeIcon.File;
  }

  contextValue = this.id === "placeholder" ? "placeholder" : 'note';
}