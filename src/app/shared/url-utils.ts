import psl from 'psl';

export const extractDomainFromUrl = (url: string): string => {
    if (url === '') {
        return '';
    }
    try {
        const urlObj = new URL(url);
        return (psl.parse(urlObj.hostname) as any).domain;
    } catch {
        return '';
    }
}