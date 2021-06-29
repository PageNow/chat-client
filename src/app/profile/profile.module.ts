import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ProfileRoutingModule } from './profile-routing.module';
import { TabsModule } from '../tabs/tabs.module';
import { ProfilePrivateComponent } from './profile-private/profile-private.component';
import { ProfilePublicComponent } from './profile-public/profile-public.component';

@NgModule({
    declarations: [
        ProfilePublicComponent,
        ProfilePrivateComponent,
    ],
    imports: [
        CommonModule,
        ProfileRoutingModule,
        TabsModule,
        NgxSpinnerModule
    ]
})
export class ProfileModule { }
