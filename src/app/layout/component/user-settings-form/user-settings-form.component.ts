import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { EnumValues } from '@app/class'
import { AppService, AppTranslateService, WindowService } from '@app/service'
import { UiLanguage } from '@app/type'
import { LeaguesService, StashService } from '@shared/module/poe/service'
import { CacheExpirationType, Language, League, PoEAccount } from '@shared/module/poe/type'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { PoEAccountService } from '../../../shared/module/poe/service/account/account.service'
import { UserSettings } from '../../type'

interface UpdateInterval {
  name: string
  value: number
}

@Component({
  selector: 'app-user-settings-form',
  templateUrl: './user-settings-form.component.html',
  styleUrls: ['./user-settings-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsFormComponent implements OnInit, OnDestroy {
  public languages = new EnumValues(Language)
  public uiLanguages = new EnumValues(UiLanguage)
  public readonly stashIntervals: UpdateInterval[] = [
    {
      name: 'default',
      value: null
    },
    {
      name: 'five-min',
      value: CacheExpirationType.Short
    },
    {
      name: 'fifteen-min',
      value: CacheExpirationType.Medium
    },
    {
      name: 'half-hour',
      value: CacheExpirationType.HalfNormal
    },
    {
      name: 'one-hour',
      value: CacheExpirationType.Normal
    },
    {
      name: 'one-day',
      value: CacheExpirationType.Long
    },
    {
      name: 'never',
      value: CacheExpirationType.Never
    },
  ]

  public leagues$ = new BehaviorSubject<League[]>([])
  public autoLaunchEnabled$: Observable<boolean>
  public downloadAvailable$: Observable<boolean>

  public account$ = new BehaviorSubject<PoEAccount>({
    loggedIn: false,
  })

  @Input()
  public settings: UserSettings

  public displayWithOpacity = (value: number) => `${Math.round(value * 100)}%`

  private accountSub: Subscription

  constructor(
    private readonly ref: ChangeDetectorRef,
    private readonly leagues: LeaguesService,
    private readonly app: AppService,
    private readonly translate: AppTranslateService,
    private readonly window: WindowService,
    private readonly accountService: PoEAccountService,
    private readonly stashService: StashService,
  ) {
  }

  public ngOnInit(): void {
    if (this.settings.language) {
      this.updateAccount()
    }
    this.autoLaunchEnabled$ = this.app.isAutoLaunchEnabled()
  }

  public ngOnDestroy(): void {
    this.accountSub?.unsubscribe()
  }

  public onAutoLaunchChange(enabled: boolean): void {
    this.autoLaunchEnabled$ = this.app
      .updateAutoLaunchEnabled(enabled)
      .pipe(map((success) => (success ? enabled : !enabled)))
  }

  public onLanguageChange(): void {
    this.updateAccount()
  }

  public onForceRefreshLeaguesClick(): void {
    this.updateLeagues(true)
  }

  public onUiLanguageChange(): void {
    this.translate.use(this.settings.uiLanguage)
  }

  public onZoomChange(): void {
    this.window.setZoom(this.settings.zoom / 100)
  }

  public relaunchApp(): void {
    this.app.relaunch()
  }

  public exitApp(): void {
    this.app.quit()
  }

  public onLoginClick(): void {
    this.accountService.login(this.settings.language).subscribe((account) => {
      this.onAccountChanged(account, true)
      this.window.focus()
    })
  }

  public onLogoutClick(): void {
    this.accountService.logout(this.settings.language).subscribe((account) => this.onAccountChanged(account, true))
  }

  public onForceRefreshStashInfoClick(): void {
    this.stashService.update(CacheExpirationType.VeryShort)
  }

  private updateLeagues(forceRefresh: boolean = false): void {
    this.leagues.getLeagues(this.settings.language, forceRefresh ? CacheExpirationType.VeryShort : CacheExpirationType.Normal).subscribe((leagues) => this.onLeaguesChanged(leagues))
  }

  private updateAccount(forceRefresh: boolean = false): void {
    if (!this.accountSub) {
      this.accountSub = this.accountService.subscribe((account) => this.onAccountChanged(account))
    }
    this.accountService.getAsync(this.settings.language, forceRefresh).subscribe((account) => this.onAccountChanged(account))
  }

  private onLeaguesChanged(leagues: League[]) {
    const selectedLeague = leagues.find((league) => league.id === this.settings.leagueId)
    if (!selectedLeague) {
      this.settings.leagueId = leagues[0].id
    }
    this.leagues$.next(leagues)
  }

  private onAccountChanged(account: PoEAccount, forceRefreshLeagues: boolean = false) {
    this.account$.next(account)
    if (forceRefreshLeagues) {
      this.leagues.getLeagues(this.settings.language, CacheExpirationType.Instant).subscribe((leagues) => this.onLeaguesChanged(leagues))
    } else {
      this.updateLeagues()
    }
    this.ref.detectChanges()
  }
}
