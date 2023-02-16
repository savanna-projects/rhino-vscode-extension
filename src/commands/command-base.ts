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

export abstract class CommandBase {
  // members: static
  public readonly logger: Logger;

  // properties
  public readonly client: RhinoClient;
  public readonly context: vscode.ExtensionContext;
  public command: string;
  public endpoint: string;
  public manifest: any;

  /**
   * Summary. Creates a new instance of VS Command for Rhino API.
   * 
   * @param context The context under which to register the command.
   */
  constructor(context: vscode.ExtensionContext) {
    // setup
    this.command = '';
    this.endpoint = 'http://localhost:9000';

    // build
    this.logger = new ExtensionLogger(Channels.extension, "CommandBase");
    this.client = new RhinoClient(Utilities.getRhinoEndpoint());
    this.context = context;
    this.manifest = Utilities.getManifest();
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
}
