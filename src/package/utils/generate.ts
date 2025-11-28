export function generateStrongPassword(length: number = 12): string {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const special = "!@#$%^&*";
    const all = lower + upper + digits + special;

    // Guarantee at least one character from each required set
    let password = [
        lower[Math.floor(Math.random() * lower.length)],
        upper[Math.floor(Math.random() * upper.length)],
        digits[Math.floor(Math.random() * digits.length)],
        special[Math.floor(Math.random() * special.length)],
    ];

    // Fill the rest of the password length with random characters
    for (let i = password.length; i < length; i++) {
        password.push(all[Math.floor(Math.random() * all.length)]);
    }

    // Shuffle the password to randomize character positions
    for (let i = password.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join("");
}

export function generateMUKCode() {
    // Generate 4 random digits
    const digits = Math.floor(Math.random() * 10000).toString().padStart(8, '0');
    return `MUK${digits}-AU`;
}

export function generateTXHashCode() {
    // Characters for uppercase letters and numbers
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = '';

    // Generate 20 random characters
    for (let i = 0; i < 20; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `TX_HASH_${hash}`;
}
