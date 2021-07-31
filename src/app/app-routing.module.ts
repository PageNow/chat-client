import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { UserRegistrationComponent } from './user-registration/user-registration.component';

const routes: Routes = [
    {
        path: 'user-registration',
        component: UserRegistrationComponent, canActivate: [ AuthGuard ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
        canActivate: [ AuthGuard ]
    },
    {
        path: 'pages',
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
        canActivate: [ AuthGuard ]
    },
    {
        path: 'search',
        loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
        canActivate: [ AuthGuard ]
    },
    { path: '', redirectTo: 'pages', pathMatch: 'full' },
    { path: '**', redirectTo: 'pages' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
