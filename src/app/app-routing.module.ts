import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { AuthGateComponent } from './auth/auth-gate/auth-gate.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthGoogleComponent } from './auth/auth-google/auth-google.component';
import { AuthSyncComponent } from './auth/auth-sync/auth-sync.component';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'auth-gate', component: AuthGateComponent },
    { path: 'auth-google', component: AuthGoogleComponent },
    { path: 'auth-sync', component: AuthSyncComponent },
    { path: 'home', component: HomeComponent, canActivate: [ AuthGuard ] },
    { path: 'auth', component: AuthComponent },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
