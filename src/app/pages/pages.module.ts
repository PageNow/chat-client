import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';

@NgModule({
    declarations: [
        PagesComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        NgxSpinnerModule,
        PagesRoutingModule
    ]
})
export class PagesModule { }
