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

/* References
 * https://stackoverflow.com/questions/60244048/login-to-chrome-extension-via-website-with-aws-amplify 
 * https://stackoverflow.com/questions/47075437/cannot-find-namespace-name-chrome
 */