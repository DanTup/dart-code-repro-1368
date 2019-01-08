'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "slow-completion" is now active!');

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'markdown' },
        new SlowCompletionProvider(),
        '.', 't', 'o', 's', 't', 'r', 'i', 'n',
    ));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class SlowCompletionProvider implements vscode.CompletionItemProvider {
    readonly dummyCompletion = "toString";
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ): Promise<vscode.CompletionList> {

        const completion = this.getCompletions(document.getText(), document.offsetAt(position));
        if (!completion)
            return;

        console.log(`Got a replacement of ${completion.replacementLength} characters from ${completion.replacementOffset}`);
        const range = new vscode.Range(document.positionAt(completion.replacementOffset), document.positionAt(completion.replacementOffset + completion.replacementLength));
        console.log(`This will replace '${document.getText(range)}' with '${completion.replacementText}'`);

        // Wait 5 seconds to simulate slow server...
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        const item = new vscode.CompletionItem(completion.replacementText);
        item.range = new vscode.Range(
            document.positionAt(completion.replacementOffset),
            document.positionAt(completion.replacementOffset + completion.replacementLength),
        );

        return new vscode.CompletionList([item]);
    }

    getCompletions(text: string, offset: number): { replacementText: string, replacementOffset: number, replacementLength: number } {
        // Clip everything after the cursor off.
        text = text.substr(0, offset);
        // Find the last dot.
        const dotIndex = text.lastIndexOf('.');
        // Find the part of the string that's been typed since.
        const partial = text.substr(dotIndex + 1);
        // Bail if this doesn't match our dummy completion.
        if (!this.dummyCompletion.startsWith(partial))
            return;

        // Otherwise, return a completion with offsets that will replace the partial
        // text with the full dummy replacement.
        return {
            replacementText: this.dummyCompletion,
            replacementOffset: dotIndex + 1,
            replacementLength: offset - dotIndex - 1,
        }
    }
}
