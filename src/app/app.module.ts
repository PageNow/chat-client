import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LOCAL_GRAPHQL_URI } from './shared/constants';
import { UserRegistrationComponent } from './user-registration/user-registration.component';

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
        FontAwesomeModule
    ],
    schemas: [],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: (httpLink: HttpLink) => {
                return {
                    cache: new InMemoryCache(),
                    link: httpLink.create({
                        uri: LOCAL_GRAPHQL_URI
                    }),
                };
            },
            deps: [HttpLink],
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
