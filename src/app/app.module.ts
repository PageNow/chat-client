import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { APOLLO_NAMED_OPTIONS, NamedOptions } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { InMemoryCache, split, ApolloLink } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { Auth } from 'aws-amplify';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { httpInterceptorProviders } from './interceptors/interceptor-provider';
import { TabsModule } from './tabs/tabs.module';
import { 
    CHAT_GQL_HTTPS_URL, CHAT_GQL_REGION, GQL_AUTH_TYPE,
    PRESENCE_GQL_HTTPS_URL, PRESENCE_GQL_REGION
} from './shared/config';

const getGqlHttpLink = (httpLink: HttpLink, uri: string) : HttpLinkHandler => {
    return httpLink.create({ uri });
};

const getGqlWsLink = (url: string, region: string) : ApolloLink => {
    return createSubscriptionHandshakeLink({
        url, region,
        auth: {
            type: GQL_AUTH_TYPE,
            jwtToken: async () =>
                (await Auth.currentSession()).getAccessToken().getJwtToken()
        }
    });
};

const getGqlLink = (httpLink: HttpLinkHandler, wsLink: ApolloLink) : ApolloLink => {
    return split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
            );
        },
        wsLink,
        httpLink
    );
};

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
        // chat graphql api backend
        {
            provide: APOLLO_NAMED_OPTIONS,
            useFactory: (httpLink: HttpLink): NamedOptions => {
                const http = getGqlHttpLink(httpLink, CHAT_GQL_HTTPS_URL);
                const ws = getGqlWsLink(CHAT_GQL_HTTPS_URL, CHAT_GQL_REGION);
                const link = getGqlLink(http, ws);
                return {
                    chat: {
                        cache: new InMemoryCache(),
                        link
                    }
                };
            },
            deps: [HttpLink]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
