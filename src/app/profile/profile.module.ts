import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfilePrivateComponent } from './profile-private/profile-private.component';
import { ProfilePublicComponent } from './profile-public/profile-public.component';

@NgModule({
    declarations: [
        ProfilePublicComponent,
        ProfilePrivateComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        NgxSpinnerModule,
        ProfileRoutingModule,
    ],
    exports: [
        ProfilePublicComponent
    ]
})
export class ProfileModule { }
