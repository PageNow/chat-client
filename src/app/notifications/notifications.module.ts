import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NotificationsComponent } from './notifications.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { ProfileModule } from '../profile/profile.module';
import { PipeModule } from '../pipe/pipe.module';

@NgModule({
    declarations: [
        NotificationsComponent
    ],
    imports: [
        CommonModule,
        NgxSpinnerModule,
        FontAwesomeModule,
        TranslateModule.forChild(),
        NotificationsRoutingModule,
        ProfileModule,
        PipeModule
    ]
})
export class NotificationsModule { }
