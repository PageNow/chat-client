import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ReversePipe } from "./array.pipe";
import { DateFormatPipe } from "./date.pipe";

@NgModule({
    declarations: [
        ReversePipe,
        DateFormatPipe
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ReversePipe,
        DateFormatPipe
    ]
})
export class PipeModule { }
