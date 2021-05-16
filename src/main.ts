/// <reference types="chrome" />
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { Amplify } from '@aws-amplify/core';
import awsmobile from './aws-exports';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
  
Amplify.configure(awsmobile);

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
