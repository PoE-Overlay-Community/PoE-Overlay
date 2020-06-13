import { async, TestBed } from '@angular/core/testing'
import { SharedModule } from '@shared/shared.module'
import { flatMap } from 'rxjs/operators'
import { ContextService } from '..'
import { Item, ItemCategory, Language } from '../../type'
import { CurrencyService } from '../currency/currency.service'
import { ItemExchangeRateService } from './item-exchange-rate.service'

describe('ItemExchangeRateService', () => {
  let sut: ItemExchangeRateService
  let contextService: ContextService
  let currencyService: CurrencyService

  beforeEach((done) => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
    }).compileComponents()
    sut = TestBed.inject<ItemExchangeRateService>(ItemExchangeRateService)

    contextService = TestBed.inject<ContextService>(ContextService)
    contextService
      .init({
        language: Language.English,
      })
      .subscribe(() => done())
    currencyService = TestBed.inject<CurrencyService>(CurrencyService)
  })

  it('should get rate for item', (done) => {
    const item: Item = {
      category: ItemCategory.Prophecy,
      typeId: 'KillingRareStealsMods',
    }

    currencyService
      .searchById('chaos')
      .pipe(flatMap((chaos) => sut.get(item, [chaos])))
      .subscribe(
        (result) => {
          expect(result).toBeTruthy()
          done()
        },
        (error) => {
          done.fail(error)
        }
      )
  })
})
