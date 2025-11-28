export function timeUntil(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs <= 0) {
        return "now";
    }

    const diffMins = Math.ceil(diffMs / (60 * 1000));
    const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));

    if (diffHours >= 1) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    } else {
        return `${diffMins} minute${diffMins === 1 ? '' : 's'}`;
    }
}