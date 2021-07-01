import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxSpinnerModule } from 'ngx-spinner';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TabsComponent } from "./tabs.component";
import { RouterModule } from "@angular/router";

@NgModule({
    declarations: [TabsComponent],
    imports: [
        CommonModule,
        RouterModule,
        NgxSpinnerModule,
        FontAwesomeModule
    ],
    exports: [TabsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TabsModule {}