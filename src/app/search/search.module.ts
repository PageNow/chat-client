import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';

import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import { ProfileModule } from '../profile/profile.module';

@NgModule({
    declarations: [
        SearchComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgxSpinnerModule,
        FontAwesomeModule,
        SearchRoutingModule,
        ProfileModule
    ]
})
export class SearchModule { }
