import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { APOLLO_NAMED_OPTIONS, NamedOptions } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { Auth } from 'aws-amplify';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { httpInterceptorProviders } from './interceptors/interceptor-provider';
import { TabsModule } from './tabs/tabs.module';
import { PRESENCE_GQL_HTTPS_URL } from './shared/config';

@NgModule({
    declarations: [
        AppComponent,
        UserRegistrationComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NgxSpinnerModule,
        AppRoutingModule,
        TabsModule
    ],
    schemas: [],
    providers: [
        httpInterceptorProviders,
        {
            provide: APOLLO_NAMED_OPTIONS,
            useFactory: (httpLink: HttpLink): NamedOptions => {
                const http = httpLink.create({
                    uri: PRESENCE_GQL_HTTPS_URL
                });
                const ws = createSubscriptionHandshakeLink({
                    url: PRESENCE_GQL_HTTPS_URL,
                    region: 'us-east-1',
                    auth: {
                        type: "AMAZON_COGNITO_USER_POOLS",
                        jwtToken: async () =>
                            (await Auth.currentSession()).getAccessToken().getJwtToken()
                    }
                })
                const link = split(
                    ({ query }) => {
                        const definition = getMainDefinition(query);
                        return (
                            definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
                        );
                    },
                    ws,
                    http
                )
                return {
                    presence: {
                        cache: new InMemoryCache(),
                        link
                    }
                };
            },
            deps: [HttpLink],
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
