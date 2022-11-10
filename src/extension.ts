import * as vscode from 'vscode';
import * as path from 'path';
import fs from 'fs';
import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind
} from 'vscode-languageclient/node';

import { createDatasetDescriptorServices, DatasetDescriptorServices} from './language-server/dataset-descriptor-module';


let client: LanguageClient;

let datasetServices : DatasetDescriptorServices;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    client = startLanguageClient(context);
    datasetServices = createDatasetDescriptorServices().datasetDescription;

    context.subscriptions.push(vscode.commands.registerCommand('datadesc.loadDataset', async () => {
        //await vscode.window.showInformationMessage('Hello World!');
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Loading your data... please wait"
            },
            async progress => {
                const fileUris = await vscode.window.showOpenDialog({ canSelectFolders: false, canSelectFiles: true, canSelectMany: true, openLabel: 'Select your data files' });
                if (fileUris){
                    await loadCsv(context, fileUris[0]);
                }
            });
      
    }));




    context.subscriptions.push(vscode.commands.registerCommand('datadesc.generateDocumentation', async () => {
       await initHtmlPreview(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('datadesc.saveDocumentHTML', async () => {
        await saveDocumentHTML(context);
     }));


}


// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('out', 'language-server', 'main'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.datadesc');
    context.subscriptions.push(fileSystemWatcher);

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'dataset-descriptor' }],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'dataset-descriptor',
        'Dataset Descriptor',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
    return client;
}

async function loadCsv(context: vscode.ExtensionContext, filepath: vscode.Uri) {
    console.log('start');
    const text:string = await datasetServices.uploader.DatasetUploader.uploadDataset(filepath.fsPath);
    let snippet = new vscode.SnippetString();
    snippet.appendText(text);
    //createDatasetDescriptorServices().shared.workspace.LangiumDocuments.getOrCreateDocument()
    const editor = vscode.window.activeTextEditor;
   // editor?.insertSnippet(snippet,editor.revealRange())
    if (editor) {
        const document = editor.document;
        editor.edit(editBuilder => {
            //editBuilder.insert(new vscode.Position(document.lineCount,8),snippet);
            const regexp = new RegExp('(?:Instances:)');
            let snippetPosition = new vscode.Position(document.lineCount, 5);
            for (let index = 0; index < document.lineCount; index++) {
                let actualLine = editor.document.lineAt(index);
                let text = actualLine.text;
                console.log(text)
                if(actualLine.text.match(regexp)) {
                    snippetPosition = new vscode.Position(index+1, 4);
                }
                
            }
            editor.insertSnippet(snippet, snippetPosition);
        });
    }
    vscode.window.showInformationMessage('File Loaded :=)    Start creating your documentation');
}

let previewPanel : vscode.WebviewPanel;

async function initHtmlPreview(context: vscode.ExtensionContext) {
    let title:string = 'Dataset Documentation';
    previewPanel = vscode.window.createWebviewPanel(
        // Webview id
        'liveHTMLPreviewer',
        // Webview title
        title,
        // This will open the second column for preview inside editor
        2,
        {
            // Enable scripts in the webview
            enableScripts: false,
            retainContextWhenHidden: false,
            // And restrict the webview to only loading content from our extension's `assets` directory.
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'assets'))]
        
        }
    );
    setPreviewActiveContext(true);
    const generator =  datasetServices.generation.DocumentationGenerator;
    const text = vscode.window.activeTextEditor?.document.getText();
    
    if (text) {
   
        const returner = generator.generate(text);
        updateHtmlPreview(returner);
        console.log(returner);
       
    }

    previewPanel.onDidDispose(() => {
        setPreviewActiveContext(false);
    })
    //updateHtmlPreview("<h1> hello world </h1>")
}

function updateHtmlPreview(html : string | void) {
    if (previewPanel && html) {
        previewPanel.webview.html = html;
    }
}

function setPreviewActiveContext(value: boolean) {
    vscode.commands.executeCommand('setContext', 'liveHTMLPreviewer', value);
}

function saveDocumentHTML(context: vscode.ExtensionContext) {
    const text = previewPanel.webview.html;
    const title = previewPanel.title;
    if (text) {
        // Save the file. TO DO: Ensure only in the  workspace is saved
        vscode.workspace.workspaceFolders?.forEach(workspace => {
            const filePath = workspace.uri.fsPath + "/" + title + ".html";
            fs.writeFileSync(filePath, text, 'utf8');
            // Display a message box to the user
		    vscode.window.showInformationMessage('Congrats! Your file, '+title+'.html, has been saved in your root folder of the workspace');
        });
    }
}
