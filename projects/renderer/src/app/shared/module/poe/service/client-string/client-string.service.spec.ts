import { async, TestBed } from '@angular/core/testing'
import { SharedModule } from '@shared/shared.module'
import { Language } from '../../type'
import { ContextService } from '../context.service'
import { ClientStringService } from './client-string.service'

describe('ClientStringService', () => {
  let sut: ClientStringService
  let contextService: ContextService
  beforeEach((done) => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
    }).compileComponents()
    sut = TestBed.inject<ClientStringService>(ClientStringService)

    contextService = TestBed.inject<ContextService>(ContextService)
    contextService
      .init({
        language: Language.English,
      })
      .subscribe(() => done())
  })

  const languages: Language[] = [
    Language.English,
    Language.German,
    Language.French,
    Language.Korean,
    Language.Russian,
  ]
  const ids = ['ItemDisplayStringRarity', 'ItemDisplayStringUnique']
  ids.forEach((id) => {
    languages.forEach((language) => {
      it(`should get text for id: '${id}' in '${Language[language]}'`, () => {
        const text = sut.translate(id, language)
        expect(text.indexOf('untranslated') === -1).toBeTruthy()
      })
    })
  })
})
