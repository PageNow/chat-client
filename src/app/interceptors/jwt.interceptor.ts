import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Auth } from 'aws-amplify';
import { switchMap } from 'rxjs/operators';

import { PRESENCE_API_URL, CHAT_API_URL, EMAIL_API_URL } from '../shared/config';

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
                    if (request.url.startsWith(PRESENCE_API_URL) || request.url.startsWith(CHAT_API_URL)
                        || request.url.startsWith(EMAIL_API_URL)
                    ) {
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
