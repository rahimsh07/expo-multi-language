export function maskTextWithDots(text: string): string {
    return text
        .split(' ')
        .map(word => '.'.repeat(word.length))
        .join(' ');
}
