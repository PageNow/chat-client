import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

import { TabsModule } from '../tabs/tabs.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';

@NgModule({
    declarations: [
        PagesComponent
    ],
    imports: [
        CommonModule,
        TabsModule,
        NgxSpinnerModule,
        PagesRoutingModule
    ]
})
export class PagesModule { }
