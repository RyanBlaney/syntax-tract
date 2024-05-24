import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('syntaxTract');
  const languages = config.get('languages') || {};

  const updateDecorations = (editor: vscode.TextEditor | undefined) => {
    if (!editor) return;
    const doc = editor.document;

    for (const [lang, settings] of Object.entries(languages)) {
      if (doc.languageId === lang) {
        const words = settings.words || {};
        const color = settings.color || '#ff0000';
        const decorationType = vscode.window.createTextEditorDecorationType({
          color: color,
        });

        const decorations: vscode.DecorationOptions[] = [];

        for (const [word, symbol] of Object.entries(words)) {
          const regex = new RegExp(word, 'g');
          for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i);
            let match;
            while ((match = regex.exec(line.text)) !== null) {
              const startPos = new vscode.Position(i, match.index);
              const endPos = new vscode.Position(i, match.index + match[0].length);
              const decoration = { range: new vscode.Range(startPos, endPos), renderOptions: { after: { contentText: symbol as string } } };
              decorations.push(decoration);
            }
          }
        }

        editor.setDecorations(decorationType, decorations);
      }
    }
  };

  vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
      updateDecorations(vscode.window.activeTextEditor);
    }
  }, null, context.subscriptions);

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

export function deactivate() {}