import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxSpinnerModule } from 'ngx-spinner';

import { TabsComponent } from "./tabs.component";

@NgModule({
    declarations: [TabsComponent],
    imports: [
        CommonModule,
        NgxSpinnerModule
    ],
    exports: [TabsComponent]
})
export class TabsModule {}