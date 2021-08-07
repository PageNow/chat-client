import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfilePrivateComponent } from './profile-private/profile-private.component';

const profileRoutes: Routes = [
    { path: 'me', component: ProfilePrivateComponent }
    // { path: ':uuid', component: ProfilePublicComponent }
];

@NgModule({
    imports: [RouterModule.forChild(profileRoutes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
