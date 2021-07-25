import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Auth } from 'aws-amplify';
import { catchError, switchMap } from 'rxjs/operators';

/**
 * Appends jwt token for http requests
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    
    constructor() {
        // do nothing
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(Auth.currentSession())
            .pipe(
                switchMap((auth: any) => {
                    const jwt = auth.getIdToken().getJwtToken();
                    const with_auth_request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${jwt}`
                        }
                    });
                    return next.handle(with_auth_request);
                }),
                catchError(err => {
                    console.log(err);
                    return next.handle(request);
                })
            )
    }
}