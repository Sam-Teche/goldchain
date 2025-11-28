import {PoolClient} from 'pg';

function snakeToCamel(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            result[camelKey] = obj[key];
        }
    }

    return result;
}


async function query<T>(client: PoolClient, text: string, params: any[] = []): Promise<T[]> {
    const result = await client.query(text, params);
    return result.rows.map(row => snakeToCamel(row) as T);
}