import * as vscode from 'vscode';

interface LanguageSettings {
  words: { [key: string]: string };
  color: string;
}

let decorationType: vscode.TextEditorDecorationType | undefined;
let currentEditor: vscode.TextEditor | undefined;
let selectionChangeListener: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Syntax Tract extension is activated');

  const config = vscode.workspace.getConfiguration('syntaxTract');
  const languages: { [key: string]: LanguageSettings } = config.get('languages') || {};

  console.log('Loaded languages configuration:', languages);

  const updateDecorations = (editor: vscode.TextEditor | undefined) => {
    if (!editor || !editor.document) return;
    const doc = editor.document;

    console.log('Updating decorations for:', doc.fileName);

    const lang = doc.languageId;
    const settings = languages[lang];
    if (!settings) {
      if (decorationType) {
        editor.setDecorations(decorationType, []);
        decorationType.dispose();
        decorationType = undefined;
      }
      return;
    }

    console.log(`Applying settings for language: ${lang}`);
    const words = settings.words || {};
    const color = settings.color || '#ff0000';

    if (decorationType) {
      decorationType.dispose();
    }

    decorationType = vscode.window.createTextEditorDecorationType({
      color: color,
      textDecoration: 'none; display: none', // This hides the text
    });

    const decorations: vscode.DecorationOptions[] = [];

    for (const [word, symbol] of Object.entries(words)) {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters in word
      const regex = new RegExp(escapedWord, 'g');
      for (let i = 0; i < doc.lineCount; i++) {
        const line = doc.lineAt(i);
        let match;
        while ((match = regex.exec(line.text)) !== null) {
          const startPos = new vscode.Position(i, match.index);
          const endPos = new vscode.Position(i, match.index + match[0].length);
          const decoration = {
            range: new vscode.Range(startPos, endPos),
            renderOptions: {
              after: { contentText: symbol, color: color },
              before: { contentText: '', textDecoration: 'none; display: none;' }
            }
          };
          decorations.push(decoration);
        }
      }
    }

    editor.setDecorations(decorationType, decorations);

    // Clear decorations on the current line
    const clearDecorations = () => {
      if (!editor || !decorationType) return;
      const currentLine = editor.selection.active.line;
      const lineRange = new vscode.Range(currentLine, 0, currentLine, doc.lineAt(currentLine).text.length);
      editor.setDecorations(decorationType, decorations.filter(d => !lineRange.contains(d.range.start)));
    };

    // Remove previous listener
    if (selectionChangeListener) {
      selectionChangeListener.dispose();
    }

    selectionChangeListener = vscode.window.onDidChangeTextEditorSelection(clearDecorations);
    context.subscriptions.push(selectionChangeListener);
    clearDecorations();
  };

  const handleEditorChange = (editor: vscode.TextEditor | undefined) => {
    if (currentEditor !== editor) {
      currentEditor = editor;
      updateDecorations(editor);
    }
  };

  vscode.window.onDidChangeActiveTextEditor(handleEditorChange, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
      updateDecorations(vscode.window.activeTextEditor);
    }
  }, null, context.subscriptions);

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

export function deactivate() {
  console.log('Syntax Tract extension is deactivated');
  if (decorationType) {
    decorationType.dispose();
  }
  if (selectionChangeListener) {
    selectionChangeListener.dispose();
  }
}
