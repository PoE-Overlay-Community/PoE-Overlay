import { Injectable } from '@angular/core'
import { BaseItemTypesService } from '@shared/module/poe/service/base-item-types/base-item-types.service'
import { LoggerService } from '@app/service'
import { ItemLevelBasedRecipeProcessorService } from './item-level-based-recipe-processor.service'

@Injectable({
  providedIn: 'root',
})
export class RegalRecipeProcessorService extends ItemLevelBasedRecipeProcessorService {
  constructor(
    readonly baseItemTypeService: BaseItemTypesService,
    readonly logger: LoggerService
  ) {
    super(baseItemTypeService, logger)
  }

  protected get minItemLevel(): number {
    return 75
  }

  protected get fillerItemLevel(): number {
    return 100
  }
}
