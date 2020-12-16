import fs from 'fs';
import path from 'path';

export async function bootstrapDir(dirPath: string): Promise<void> {
    (await fs.promises.readdir(dirPath))
        .map((name: string) => path.normalize(path.join(dirPath, name)))
        .forEach(async (name: string) => {
            await import(name);
        });
}
