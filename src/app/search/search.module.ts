import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import { ProfileModule } from '../profile/profile.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        SearchComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        TranslateModule.forChild(),
        SearchRoutingModule,
        ProfileModule
    ]
})
export class SearchModule { }
