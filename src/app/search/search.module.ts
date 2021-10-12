import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
        FontAwesomeModule,
        SearchRoutingModule,
        ProfileModule
    ]
})
export class SearchModule { }
