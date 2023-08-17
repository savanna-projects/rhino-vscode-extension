/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { RhinoClient } from '../clients/rhino-client';
import { Channels } from '../constants/channels';
import { Utilities } from '../extensions/utilities';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Logger } from '../logging/logger';
import { TmLanguageCreateModel } from '../models/tm-create-model';

export abstract class CommandBase {
  // members: static
  public readonly logger: Logger;

  // properties
  public readonly client: RhinoClient;
  public readonly context: vscode.ExtensionContext;
  public command: string;
  public endpoint: string;
  public manifest: any;
  public createModel: TmLanguageCreateModel;

  /**
   * Summary. Creates a new instance of VS Command for Rhino API.
   * 
   * @param context The context under which to register the command.
   */
  constructor(context: vscode.ExtensionContext);
  constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel);
  constructor(context: vscode.ExtensionContext, createModel?: TmLanguageCreateModel) {
    // setup
    this.command = '';
    this.endpoint = 'http://localhost:9000';

    // build
    this.logger = new ExtensionLogger(Channels.extension, "CommandBase");
    this.client = new RhinoClient(Utilities.getRhinoEndpoint());
    this.context = context;
    this.manifest = Utilities.getManifest();
    if (createModel) {
      this.createModel = createModel;
    }
    this.createModel = createModel ? createModel : {};
  }

  /*┌─[ INTERFACE ]──────────────────────────────────────────
    │
    │ A collection of functions to to implement under
    │ any command.
    └────────────────────────────────────────────────────────*/
  /**
   * Summary. When implemented, returns registerable command
   */
  public register(): Promise<any> {
    return this.onRegister();
  }

  protected abstract onRegister(): Promise<any>;

  /**
   * Summary. Implement the command invoke pipeline.
   */
  public invokeCommand(): Promise<any> {
    return this.onInvokeCommand();
  }

  protected abstract onInvokeCommand(): Promise<any>;

  /**
   * Summary. Saves the open document.
   */
  public async saveOpenDocument() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      await activeEditor.document.save();
    }
  }

  /**
   * Summary. Saves all open documents.
   */
  public async saveAllDocuments() {
    await vscode.workspace.saveAll();
  }
}
