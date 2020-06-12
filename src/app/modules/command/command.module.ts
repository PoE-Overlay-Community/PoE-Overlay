import { NgModule, Injectable } from '@angular/core'
import { FEATURE_MODULES } from '@app/token'
import { Feature, FeatureModule } from '@app/type'
import { SharedModule } from '@shared/shared.module'
import { UserSettingsFeature } from 'src/app/layout/type'
import { CommandSettingsComponent, CommandUserSettings } from './component'
import { CommandService } from './service/command.service'

@NgModule({
  providers: [{ provide: FEATURE_MODULES, useClass: CommandModule, multi: true }],
  declarations: [CommandSettingsComponent],
  imports: [SharedModule],
})
export class CommandModule implements FeatureModule {
  constructor(private readonly commandService: CommandService) {}

  public getSettings(): UserSettingsFeature {
    const defaultSettings: CommandUserSettings = {
      commands: [
        {
          text: '/hideout',
          shortcut: 'F5',
        },
        {
          text: '/dnd',
          shortcut: 'F6',
        },
      ],
    }
    return {
      name: 'command.name',
      component: CommandSettingsComponent,
      defaultSettings,
    }
  }

  public getFeatures(settings: CommandUserSettings): Feature[] {
    return settings.commands
      .filter((command) => command.text && command.shortcut)
      .map((command) => {
        const feature: Feature = {
          name: command.text,
          accelerator: command.shortcut,
        }
        return feature
      })
  }

  public run(feature: string): void {
    this.commandService.command(feature)
  }
}
