import { Injectable } from '@angular/core'
import { ClientStringProvider } from '../../provider'
import { Language } from '../../type'
import { ContextService } from '../context.service'

@Injectable({
  providedIn: 'root',
})
export class ClientStringService {
  constructor(
    private readonly context: ContextService,
    private readonly clientStringProvider: ClientStringProvider
  ) {}

  public translate(id: string, language?: Language): string {
    language = language || this.context.get().language

    const map = this.clientStringProvider.provide(language)
    return map[id] || `untranslated: '${id}' for language: '${Language[language]}'`
  }

  public translateMultiple(idRegex: RegExp, language?: Language): string[] {
    language = language || this.context.get().language

    const map = this.clientStringProvider.provide(language)
    const translations: string[] = []
    for (const id in map) {
      if (idRegex.test(id)) {
        translations.push(map[id])
      }
    }
    return translations
  }
}
