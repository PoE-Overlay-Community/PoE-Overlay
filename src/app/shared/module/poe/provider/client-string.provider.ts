import { Injectable } from '@angular/core'
import {
  English,
  French,
  German,
  Korean,
  Portuguese,
  Russian,
  SimplifiedChinese,
  Spanish,
  Thai,
  TraditionalChinese,
} from '../../../../../assets/poe/client-strings.json'
import { ClientStringMap, Language } from '../type'

@Injectable({
  providedIn: 'root',
})
export class ClientStringProvider {
  public provide(language: Language): ClientStringMap {
    switch (language) {
      case Language.English:
        return English
      case Language.Portuguese:
        return Portuguese
      case Language.Russian:
        return Russian
      case Language.Thai:
        return Thai
      case Language.German:
        return German
      case Language.French:
        return French
      case Language.Spanish:
        return Spanish
      case Language.Korean:
        return Korean
      // case Language.SimplifiedChinese:
      //     return SimplifiedChinese;
      case Language.TraditionalChinese:
        return TraditionalChinese
      default:
        throw new Error(`Could not map clientstrings to language: '${Language[language]}'.`)
    }
  }
}
