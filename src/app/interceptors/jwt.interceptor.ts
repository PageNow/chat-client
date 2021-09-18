import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Auth } from 'aws-amplify';
import { switchMap } from 'rxjs/operators';

import { CHAT_GQL_HTTPS_URL } from '../shared/config';
import { PRESENCE_API_URL } from '../shared/constants';

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
                    let withAuthRequest;
                    if (request.url.startsWith(PRESENCE_API_URL) || request.url === CHAT_GQL_HTTPS_URL) {
                        withAuthRequest = request.clone({
                            setHeaders: {
                                Authorization: jwt,
                            }
                        });
                    } else {
                        withAuthRequest = request.clone({
                            setHeaders: {
                                Authorization: `Bearer ${jwt}`
                            }
                        });
                    }
                    return next.handle(withAuthRequest);
                })
            );
    }
}
