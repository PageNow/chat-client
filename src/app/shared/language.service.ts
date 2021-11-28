import { Injectable, OnDestroy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";

import { LANGUAGES } from "./config";
import { LANG_EN } from "./constants";

@Injectable({
    providedIn: 'root'
})
export class LanguageService implements OnDestroy {
    public userLanguage = 'en-US';
    public userLanguageSubject = new Subject<string>();

    constructor(
        private translateService: TranslateService
    ) {
        let userLanguage = localStorage.getItem('language');
        if (userLanguage === undefined || userLanguage === null) {
            userLanguage = this.translateService.getBrowserCultureLang();
        }
        if (LANGUAGES.indexOf(userLanguage) === -1) {
            userLanguage = LANG_EN;
        }
        this.userLanguage = userLanguage;
        this.userLanguageSubject.next(userLanguage);
        this.translateService.addLangs(LANGUAGES);
        this.translateService.setDefaultLang(LANG_EN);
        this.translateService.use(userLanguage);

        window.addEventListener('storage', this.storageEventListener.bind(this));
    }

    ngOnDestroy(): void {
        window.removeEventListener('storage', this.storageEventListener.bind(this));
    }

    public updateUserLanguage(language: string): void {
        if (LANGUAGES.indexOf(language) === -1) {
            return;
        }
        this.userLanguage = language;
        this.userLanguageSubject.next(language);
        this.translateService.use(language);
    }

    private storageEventListener(e: StorageEvent): void {
        if (e.key === 'language' && e.newValue && e.newValue !== this.userLanguage) {
            this.updateUserLanguage(e.newValue);
        }
    }
}