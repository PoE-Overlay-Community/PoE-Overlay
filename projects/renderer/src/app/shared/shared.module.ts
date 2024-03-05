import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { NgxChartsModule } from '@swimlane/ngx-charts'
import { MaterialModule } from './module/material/material.module'
import { PoeModule } from './module/poe/poe.module'

@NgModule({
  exports: [
    // default
    CommonModule,
    RouterModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    FormsModule,

    // third party
    NgxChartsModule,
    TranslateModule,

    // modules
    MaterialModule,
    PoeModule,
  ],
})
export class SharedModule {}
