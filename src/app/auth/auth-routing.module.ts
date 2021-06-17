  
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthPageComponent } from './auth-page/auth-page.component';
import { AuthGateComponent } from './auth-gate/auth-gate.component';
import { AuthGoogleComponent } from './auth-google/auth-google.component';
import { AuthSyncComponent } from './auth-sync/auth-sync.component';

const authRoutes: Routes = [
    { path: 'gate', component: AuthGateComponent },
    { path: 'google', component: AuthGoogleComponent },
    { path: 'sync', component: AuthSyncComponent },
    { path: 'page', component: AuthPageComponent },
];

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }