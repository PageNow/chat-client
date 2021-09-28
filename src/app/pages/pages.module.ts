import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule } from '@angular/forms';
import { ProfileModule } from '../profile/profile.module';

@NgModule({
    declarations: [
        PagesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        NgxSpinnerModule,
        PagesRoutingModule,
        ProfileModule
    ]
})
export class PagesModule { }
