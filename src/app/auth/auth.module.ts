import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import { NbInputModule, NbButtonModule } from '@nebular/theme';

import { AuthPageComponent } from './auth-page/auth-page.component';
import { AuthSyncComponent } from './auth-sync/auth-sync.component';
import { AuthGateComponent } from './auth-gate/auth-gate.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
    declarations: [
        AuthPageComponent,
        AuthSyncComponent,
        AuthGateComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        NbInputModule,
        NbButtonModule,
        AuthRoutingModule
    ]
})
export class AuthModule { }