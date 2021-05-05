import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Auth from '@aws-amplify/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return Auth.currentAuthenticatedUser()
            .then(() => {
                console.log('auth');
                return true;
            })
            .catch(() => {
                console.log('non-auth');
                this._router.navigate(['/auth']);
                return false;
            });
    }
}