import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BrowserService, LoggerService } from '@app/service'
import { environment } from '@env/environment'
import { Observable, of, throwError } from 'rxjs'
import { delay, flatMap, retryWhen } from 'rxjs/operators'
import { ItemOverviewResponse } from '../schema/item-overview'

export enum ItemOverviewType {
  // General
  AllflameEmber = 'AllflameEmber',
  Tattoo = 'Tattoo',
  Omen = 'Omen',
  DivinationCard = 'DivinationCard',
  Artifact = 'Artifact',
  Oil = 'Oil',
  Incubator = 'Incubator',
  // Equipment & Gems
  UniqueWeapon = 'UniqueWeapon',
  UniqueArmour = 'UniqueArmour',
  UniqueAccessory = 'UniqueAccessory',
  UniqueFlask = 'UniqueFlask',
  UniqueJewel = 'UniqueJewel',
  SkillGem = 'SkillGem',
  // Atlas
  Map = 'Map',
  BlightedMap = 'BlightedMap',
  UniqueMap = 'UniqueMap',
  DeliriumOrb = 'DeliriumOrb',
  Invitation = 'Invitation',
  Scarab = 'Scarab',
  Watchstone = 'Watchstone',
  // Crafting
  Fossil = 'Fossil',
  Resonator = 'Resonator',
  Beast = 'Beast',
  Essence = 'Essence',
  Vial = 'Vial',
  // Deprecated (Harvest League)
  Prophecy = 'Prophecy',
  Seed = 'Seed',
}

const PATH_TYPE_MAP = {
  // General
  [ItemOverviewType.Tattoo]: 'tattoo',
  [ItemOverviewType.Omen]: 'omen',
  [ItemOverviewType.DivinationCard]: 'divinationcards',
  [ItemOverviewType.Artifact]: 'artifacts',
  [ItemOverviewType.Oil]: 'oils',
  [ItemOverviewType.Incubator]: 'incubators',
  // Equipment & Gems
  [ItemOverviewType.UniqueWeapon]: 'unique-weapons',
  [ItemOverviewType.UniqueArmour]: 'unique-armours',
  [ItemOverviewType.UniqueAccessory]: 'unique-accessories',
  [ItemOverviewType.UniqueFlask]: 'unique-flaks',
  [ItemOverviewType.UniqueJewel]: 'unique-jewels',
  [ItemOverviewType.SkillGem]: 'skill-gems',
  // Atlas
  [ItemOverviewType.Map]: 'maps',
  [ItemOverviewType.BlightedMap]: 'blighted-maps',
  [ItemOverviewType.UniqueMap]: 'unique-maps',
  [ItemOverviewType.DeliriumOrb]: 'delirium-orbs',
  [ItemOverviewType.Invitation]: 'invitations',
  [ItemOverviewType.Scarab]: 'scarabs',
  [ItemOverviewType.Watchstone]: 'watchstones',
  // Crafting
  [ItemOverviewType.Fossil]: 'fossils',
  [ItemOverviewType.Resonator]: 'resonators',
  [ItemOverviewType.Beast]: 'beats',
  [ItemOverviewType.Essence]: 'essences',
  [ItemOverviewType.Vial]: 'vials',
  // Deprecated (Harvest League)
  [ItemOverviewType.Prophecy]: 'prophecies',
  [ItemOverviewType.Seed]: 'seeds',
}

const RETRY_COUNT = 3
const RETRY_DELAY = 100

@Injectable({
  providedIn: 'root',
})
export class ItemOverviewHttpService {
  private readonly baseUrl: string

  constructor(
    private readonly httpClient: HttpClient,
    private readonly browser: BrowserService,
    private readonly logger: LoggerService
  ) {
    this.baseUrl = `${environment.poeNinja.baseUrl}/api/data/itemoverview`
  }

  public get(leagueId: string, type: ItemOverviewType): Observable<ItemOverviewResponse> {
    const url = this.getUrl(leagueId, type)
    return this.httpClient.get<ItemOverviewResponse>(url).pipe(
      retryWhen((errors) =>
        errors.pipe(flatMap((response, count) => this.handleError(url, response, count)))
      ),
      flatMap((response) => {
        if (!response?.lines) {
          if (leagueId !== 'Standard') {
            this.logger.info(
              `Got empty result from '${url}'. Using Standard league for now.`,
              response
            )
            return this.get('Standard', type)
          }
          this.logger.warn(`Got empty result from '${url}'.`, response)
          return throwError(`Got empty result from '${url}'.`)
        }

        const result: ItemOverviewResponse = {
          lines: response.lines,
          url: `${environment.poeNinja.baseUrl}/challenge/${PATH_TYPE_MAP[type]}`,
        }
        return of(result)
      })
    )
  }

  private handleError(url: string, response: HttpErrorResponse, count: number): Observable<void> {
    if (count >= RETRY_COUNT) {
      return throwError(response)
    }

    switch (response.status) {
      case 403:
        return this.browser.retrieve(url).pipe(delay(RETRY_DELAY))
      default:
        return of(null).pipe(delay(RETRY_DELAY))
    }
  }

  private getUrl(leagueId: string, type: ItemOverviewType): string {
    return `${this.baseUrl}?league=${encodeURIComponent(leagueId)}&type=${encodeURIComponent(
      type
    )}&language=en`
  }
}
