"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const node_1 = require("vscode-languageclient/node");
const dataset_descriptor_module_1 = require("./language-server/dataset-descriptor-module");
let client;
let datasetServices;
// This function is called when the extension is activated.
function activate(context) {
    client = startLanguageClient(context);
    datasetServices = (0, dataset_descriptor_module_1.createDatasetDescriptorServices)().datasetDescription;
    context.subscriptions.push(vscode.commands.registerCommand('datadesc.loadDataset', () => __awaiter(this, void 0, void 0, function* () {
        //await vscode.window.showInformationMessage('Hello World!');
        const fileUris = yield vscode.window.showOpenDialog({ canSelectFolders: false, canSelectFiles: true, canSelectMany: true, openLabel: 'Select your data files' });
        if (fileUris) {
            yield loadCsv(context, fileUris[0]);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('datadesc.generateDocumentation', () => __awaiter(this, void 0, void 0, function* () {
        yield initHtmlPreview(context);
    })));
}
exports.activate = activate;
// This function is called when the extension is deactivated.
function deactivate() {
    if (client) {
        return client.stop();
    }
    return undefined;
}
exports.deactivate = deactivate;
function startLanguageClient(context) {
    const serverModule = context.asAbsolutePath(path.join('out', 'language-server', 'main'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.datadesc');
    context.subscriptions.push(fileSystemWatcher);
    // Options to control the language client
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'dataset-descriptor' }],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher
        }
    };
    // Create the language client and start the client.
    const client = new node_1.LanguageClient('dataset-descriptor', 'Dataset Descriptor', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
    return client;
}
function loadCsv(context, filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('start');
        const text = yield datasetServices.uploader.DatasetUploader.uploadDataset(filepath.fsPath);
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
                    console.log(text);
                    if (actualLine.text.match(regexp)) {
                        snippetPosition = new vscode.Position(index + 1, 4);
                    }
                }
                editor.insertSnippet(snippet, snippetPosition);
            });
        }
        yield vscode.window.showInformationMessage('File Loaded');
    });
}
let previewPanel;
function initHtmlPreview(context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!previewPanel) {
            previewPanel = vscode.window.createWebviewPanel(
            // Webview id
            'liveHTMLPreviewer', 
            // Webview title
            'Dataset Documentation Preview', 
            // This will open the second column for preview inside editor
            2, {
                // Enable scripts in the webview
                enableScripts: true,
                retainContextWhenHidden: true,
                // And restrict the webview to only loading content from our extension's `assets` directory.
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'assets'))]
            });
        }
        const generator = datasetServices.generation.DocumentationGenerator;
        const text = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText();
        if (text) {
            const returner = generator.generate(text);
            console.log(returner);
            updateHtmlPreview(generator.generate(text));
        }
    });
}
function updateHtmlPreview(html) {
    if (previewPanel && html) {
        previewPanel.webview.html = html;
    }
}
//# sourceMappingURL=extension.js.map