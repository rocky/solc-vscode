/* This code is modelled off of scode/extensions/typescript-language-features/src/configuration.ts

   This largely handles user-tweakably customization and configuration of the language client.
*/

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import * as arrays from './arrays';

export enum SolidityServerLogLevel {
  Off,
  Normal,
  Terse,
  Verbose,
}

export namespace SolidityServerLogLevel {
  export function fromString(value: string): SolidityServerLogLevel {
    switch (value && value.toLowerCase()) {
      case 'normal':
        return SolidityServerLogLevel.Normal;
      case 'terse':
        return SolidityServerLogLevel.Terse;
      case 'verbose':
        return SolidityServerLogLevel.Verbose;
      case 'off':
      default:
        return SolidityServerLogLevel.Off;
    }
  }

  export function toString(value: SolidityServerLogLevel): string {
    switch (value) {
      case SolidityServerLogLevel.Normal:
        return 'normal';
      case SolidityServerLogLevel.Terse:
        return 'terse';
      case SolidityServerLogLevel.Verbose:
        return 'verbose';
      case SolidityServerLogLevel.Off:
      default:
        return 'off';
    }
  }
}

export class SolidityServiceConfiguration {
  public readonly npmLocation: string | null;
  public readonly solServerLogLevel: SolidityServerLogLevel = SolidityServerLogLevel.Off;
  public readonly solServerPluginPaths: string[];

  public static loadFromWorkspace(): SolidityServiceConfiguration {
    return new SolidityServiceConfiguration();
  }

  private constructor() {
    const configuration = vscode.workspace.getConfiguration();

    this.npmLocation = SolidityServiceConfiguration.readNpmLocation(configuration);
    this.solServerLogLevel = SolidityServiceConfiguration.readSolidityServerLogLevel(configuration);
    this.solServerPluginPaths = SolidityServiceConfiguration.readTsServerPluginPaths(configuration);
  }

  public isEqualTo(other: SolidityServiceConfiguration): boolean {
    return this.npmLocation === other.npmLocation
      && this.solServerLogLevel === other.solServerLogLevel
      && arrays.equals(this.solServerPluginPaths, other.solServerPluginPaths);
  }

  private static readSolidityServerLogLevel(configuration: vscode.WorkspaceConfiguration): SolidityServerLogLevel {
    const setting = configuration.get<string>('solidity.server.log', 'verbose');
    return SolidityServerLogLevel.fromString(setting);
  }

  private static readTsServerPluginPaths(configuration: vscode.WorkspaceConfiguration): string[] {
    return configuration.get<string[]>('solidity.server.pluginPaths', []);
  }

  private static readNpmLocation(configuration: vscode.WorkspaceConfiguration): string | null {
    return configuration.get<string | null>('solidity.npm', null);
  }

}
