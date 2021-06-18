import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbInputModule, NbButtonModule } from '@nebular/theme';
import { NgxSpinnerModule } from "ngx-spinner";

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
        NbInputModule,
        NbButtonModule,
        AuthRoutingModule,
        NgxSpinnerModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthModule { }