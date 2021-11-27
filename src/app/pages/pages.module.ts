import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule } from '@angular/forms';
import { ProfileModule } from '../profile/profile.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        PagesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        NgxSpinnerModule,
        FontAwesomeModule,
        PagesRoutingModule,
        ProfileModule,
        TranslateModule.forChild()
    ]
})
export class PagesModule { }
