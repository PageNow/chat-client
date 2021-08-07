import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

import { NotificationsComponent } from './notifications.component';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
    declarations: [
        NotificationsComponent
    ],
    imports: [
        CommonModule,
        NgxSpinnerModule,
        NotificationsRoutingModule
    ]
})
export class NotificationsModule { }
