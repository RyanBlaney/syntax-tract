import * as vscode from 'vscode';

interface LanguageSettings {
  words: { [key: string]: string };
  color: string;
  hideBraces?: boolean;
}

let decorationType: vscode.TextEditorDecorationType | undefined;
let braceDecorationType: vscode.TextEditorDecorationType | undefined;
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
      if (braceDecorationType) {
        editor.setDecorations(braceDecorationType, []);
        braceDecorationType.dispose();
        braceDecorationType = undefined;
      }
      return;
    }

    console.log(`Applying settings for language: ${lang}`);
    const words = settings.words || {};
    const color = settings.color || '#ff0000';
    const hideBraces = settings.hideBraces || false;

    if (decorationType) {
      decorationType.dispose();
    }

    decorationType = vscode.window.createTextEditorDecorationType({
      color: color,
      textDecoration: 'none; display: none', // This hides the text
    });

    if (braceDecorationType) {
      braceDecorationType.dispose();
    }

    braceDecorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: 'none; display: none;', // This hides the braces
    });

    const decorations: vscode.DecorationOptions[] = [];
    const braceDecorations: vscode.DecorationOptions[] = [];

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

    
    const bracePairs: { open: vscode.Range, close: vscode.Range }[] = [];

    if (hideBraces) {
      const braceScope: vscode.Position[] = [];
      const braceRegex = /[{}]/g;
      for (let i = 0; i < doc.lineCount; i++) {
        const line = doc.lineAt(i);
        let match;
        while ((match = braceRegex.exec(line.text)) !== null) {
          const bracePos = new vscode.Position(i, match.index);
          if (line.text[match.index] === '{') {
            braceScope.push(bracePos);
          } else if (line.text[match.index] === '}' && braceScope.length > 0) {
             const openBracePos = braceScope.pop()!;
            bracePairs.push({ 
              open: new vscode.Range(openBracePos, 
                openBracePos.translate(0, 1)), 
              close: new vscode.Range(bracePos, 
                bracePos.translate(0, 1)) 
            });
          }
        }
      }

      for (const pair of bracePairs) {
        braceDecorations.push({ 
          range: pair.open, 
          renderOptions: { 
            after: { contentText: '', color: color }, 
            before: { contentText: '', textDecoration: 'none; display: none;' } 
          } 
        });
        braceDecorations.push({ 
          range: pair.close, 
          renderOptions: { 
            after: { contentText: '', color: color }, 
            before: { contentText: '', textDecoration: 'none; display: none;' } 
          } 
        });
      }
    }

    editor.setDecorations(decorationType, decorations);
    if (hideBraces) {
      editor.setDecorations(braceDecorationType, braceDecorations);
    }

    // Clear decorations on the current line
    const clearDecorations = () => {
      if (!editor || !decorationType) return;
      const currentLine = editor.selection.active.line;
      const lineRange = new vscode.Range(currentLine, 0, currentLine, doc.lineAt(currentLine).text.length);
      editor.setDecorations(decorationType, decorations.filter(d => !lineRange.contains(d.range.start)));
      
      if (hideBraces && braceDecorationType) {
        const position = editor.selection.active;
        const currentBracePair = bracePairs.find(pair => position.isAfterOrEqual(pair.open.start) 
          && position.isBeforeOrEqual(pair.close.end)
          || position.line === pair.open.start.line);
        if (currentBracePair) {
          editor.setDecorations(braceDecorationType, 
            braceDecorations.filter(d => !d.range.isEqual(currentBracePair.open) 
            && !d.range.isEqual(currentBracePair.close)));
        } else {
          editor.setDecorations(braceDecorationType, braceDecorations);
        }
      }
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
  if (braceDecorationType) {
    braceDecorationType.dispose();
  }
  if (selectionChangeListener) {
    selectionChangeListener.dispose();
  }
}
