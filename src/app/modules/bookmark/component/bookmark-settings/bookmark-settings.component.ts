import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UserSettings, UserSettingsComponent } from 'src/app/layout/type'

export interface BookmarkUserSettings extends UserSettings {
  bookmarks: BookmarkUserBookmark[]
}

export interface BookmarkUserBookmark {
  url: string
  shortcut: string
  external: boolean
}

@Component({
  selector: 'app-bookmark-settings',
  templateUrl: './bookmark-settings.component.html',
  styleUrls: ['./bookmark-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkSettingsComponent implements UserSettingsComponent {
  @Input()
  public settings: BookmarkUserSettings

  public load(): void {
    // stub
  }

  public onAddClick(): void {
    this.addBookmark()
  }

  public onRemoveClick(index: number): void {
    this.removeBookmark(index)
  }

  private addBookmark(): void {
    this.settings.bookmarks.push({
      url: 'https://github.com/PoE-Overlay-Community/PoE-Overlay-Community-Fork',
      shortcut: undefined,
      external: false,
    })
  }

  private removeBookmark(index: number): void {
    this.settings.bookmarks.splice(index, 1)
  }
}
