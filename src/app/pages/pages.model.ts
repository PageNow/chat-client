export interface Page {
    url: string;
    title: string;
    domain: string;
}

export interface Presence {
    userId: string;
    page: Page | null;
    latestPage: Page | null;
}
