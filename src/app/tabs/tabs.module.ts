import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxSpinnerModule } from 'ngx-spinner';

import { TabsComponent } from "./tabs.component";
import { RouterModule } from "@angular/router";

@NgModule({
    declarations: [TabsComponent],
    imports: [
        CommonModule,
        RouterModule,
        NgxSpinnerModule
    ],
    exports: [TabsComponent]
})
export class TabsModule {}