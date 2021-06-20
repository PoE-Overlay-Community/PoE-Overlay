import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core'
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip'
import { AppTranslateService } from '@app/service'
import { CommandService } from '@modules/command/service/command.service'
import { SnackBarService } from '@shared/module/material/service'
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service'
import {
    CurrencyAmount,
    StashGridMode,
    TradeCompanionOption,
    TradeCompanionUserSettings,
    TradeNotification,
    TradeNotificationType
} from '@shared/module/poe/type/trade-companion.type'
import moment from 'moment'
import { Subscription, timer } from 'rxjs'

const tooltipDefaultOptions: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 500,
  touchendHideDelay: 1000,
}

@Component({
  selector: 'app-trade-notification',
  templateUrl: './trade-notification.component.html',
  styleUrls: ['./trade-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipDefaultOptions }],
})
export class TradeNotificationComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  public settings: TradeCompanionUserSettings

  @Input()
  public notification: TradeNotification

  @Output()
  public dismissNotification = new EventEmitter<TradeNotification>()

  // Make the enum available in the html
  public TradeNotificationType = TradeNotificationType

  public collapsed = false

  public elapsedTime = '0s'

  private stashGridSubscription: Subscription

  private buttonClickAudioClip: HTMLAudioElement

  constructor(
    private readonly stashGridService: TradeCompanionStashGridService,
    private readonly snackbar: SnackBarService,
    private readonly commandService: CommandService,
    private readonly ref: ChangeDetectorRef,
    private readonly translate: AppTranslateService,
  ) {}

  public ngOnInit(): void {
    setInterval(() => {
      const diff = moment.duration(moment().diff(this.notification.time))
      const minutes = Math.floor(diff.minutes())
      if (minutes > 0) {
        const hours = Math.floor(diff.hours())
        if (hours > 0) {
          this.elapsedTime = this.translate.get(
            'trade-companion.trade-notification.elapsed-minutes',
            { hours, minutes }
          )
        } else {
          this.elapsedTime = this.translate.get(
            'trade-companion.trade-notification.elapsed-minutes',
            { minutes }
          )
        }
      } else {
        const seconds = Math.floor(diff.seconds())
        this.elapsedTime = this.translate.get(
          'trade-companion.trade-notification.elapsed-seconds',
          { seconds }
        )
      }
      this.ref.detectChanges()
    }, 1000)
  }

  public ngOnDestroy(): void {
    if (this.buttonClickAudioClip) {
      if (!this.buttonClickAudioClip.ended) {
        const scopedEndedHandler = () => {
          this.buttonClickAudioClip.removeEventListener('ended', scopedEndedHandler)
          this.buttonClickAudioClip.remove()
        }
        this.buttonClickAudioClip.addEventListener('ended', scopedEndedHandler)
      } else {
        this.buttonClickAudioClip.remove()
      }
    }
    if (this.stashGridSubscription) {
      this.toggleItemHighlight()
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings']) {
      const buttonClickAudio = this.settings.buttonClickAudio
      if (buttonClickAudio.enabled) {
        if (!this.buttonClickAudioClip) {
          this.buttonClickAudioClip = new Audio()
        }
        this.buttonClickAudioClip.src = buttonClickAudio.src
        this.buttonClickAudioClip.volume = buttonClickAudio.volume
      } else if (this.buttonClickAudioClip) {
        this.buttonClickAudioClip.remove()
        this.buttonClickAudioClip = null
      }
    }
  }

  public itemExchangeRatio(): number {
    return this.floorMD(
      this.notification.price.amount / (this.notification.item as CurrencyAmount).amount,
      3
    )
  }

  public dismissClick(): void {
    this.buttonClickAudioClip?.play()
    this.dismiss()
  }

  public toggleCollapsedClick(): void {
    this.buttonClickAudioClip?.play()
    this.collapsed = !this.collapsed
  }

  public visitPlayerHideoutClick(): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(`/hideout ${this.notification.playerName}`)
  }

  public leavePartyClick(): void {
    this.buttonClickAudioClip?.play()
    this.leaveParty()
  }

  public inviteToPartyClick(): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(`/invite ${this.notification.playerName}`)
    if (
      this.settings.showStashGridOnInvite &&
      !this.stashGridSubscription &&
      this.notification.type === TradeNotificationType.Incoming
    ) {
      this.toggleItemHighlight()
    }
  }

  public kickFromPartyClick(): void {
    this.buttonClickAudioClip?.play()
    this.kickFromParty()
  }

  public requestTradeClick(): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(`/tradewith ${this.notification.playerName}`)
    if (
      this.settings.hideStashGridOnTrade &&
      this.stashGridSubscription &&
      this.notification.type === TradeNotificationType.Incoming
    ) {
      this.toggleItemHighlight()
    }
  }

  public whoisClick(): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(`/whois ${this.notification.playerName}`)
  }

  public whisperPlayerClick(): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(`@${this.notification.playerName} `, false)
  }

  public repeatTradeWhisperClick(): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(this.notification.text)
  }

  public askStillInterestedClick(): void {
    this.buttonClickAudioClip?.play()
    let item: string
    if (this.notification.itemLocation) {
      item = this.notification.item as string
    } else {
      const currencyAmount = this.notification.item as CurrencyAmount
      item = `${currencyAmount.amount} ${currencyAmount.currency.nameType}`
    }
    // TODO: Translate?
    this.commandService.command(
      `@${this.notification.playerName} Hi, are you still interested in ${item} for ${this.notification.price.amount} ${this.notification.price.currency.nameType}?`
    )
  }

  public toggleItemHighlightClick(): void {
    this.buttonClickAudioClip?.play()
    this.toggleItemHighlight()
  }

  public tradeOptionClick(tradeOption: TradeCompanionOption): void {
    this.buttonClickAudioClip?.play()
    this.commandService.command(`@${this.notification.playerName} ${tradeOption.whisperMessage}`)
    if (tradeOption.kickAfterWhisper) {
      timer(550).subscribe(() => {
        switch (this.notification.type) {
          case TradeNotificationType.Incoming:
            this.kickFromParty()
            break
          case TradeNotificationType.Outgoing:
            this.leaveParty()
            break
        }
        if (tradeOption.dismissNotification) {
          this.dismiss()
        }
      })
    } else if (tradeOption.dismissNotification) {
      this.dismiss()
    }
  }

  // Floors the value to a meaningful amount of decimals
  private floorMD(n: number, d: number): number {
    const log10 = n ? Math.floor(Math.log10(n)) : 0
    const div = log10 < 0 ? Math.pow(10, 1 - log10) : Math.pow(10, d)
    return Math.floor(n * div) / div
  }

  private dismiss(): void {
    this.dismissNotification.emit(this.notification)
  }

  private leaveParty(): void {
    // TODO: use `/kick [playerName]` where [playerName] is your own character name,
    //        which we should allow the user to input in their settings.
    this.snackbar.warning('[TradeCompanion] Missing Feature: Leave Party')
  }

  private kickFromParty(): void {
    this.commandService.command(`/kick ${this.notification.playerName}`)
    this.dismiss()
  }

  private toggleItemHighlight(): void {
    if (this.stashGridSubscription) {
      this.stashGridSubscription.unsubscribe()
      this.stashGridSubscription = null
      this.stashGridService.hideStashGrid()
    } else {
      this.stashGridService.getStashGridType(this.notification.itemLocation).subscribe((gridType) => {
        this.stashGridSubscription = this.stashGridService
          .showStashGrid({
            gridMode: StashGridMode.Normal,
            gridType,
            highlightLocation: this.notification.itemLocation,
          })
          .subscribe(() => {
            this.stashGridSubscription.unsubscribe()
            this.stashGridSubscription = null
          })
      })
    }
  }
}
