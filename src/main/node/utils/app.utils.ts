import { log } from '@config';
import { constants } from '@constants';
import { statSync } from 'fs';
import tar from 'tar';

export const listArchiveFiles = (archive: string) => {
    log.verbose('listing tar files');
    const files: string[] = [];
    return new Promise<string[]>((resolve, reject) => {
        try {
            const stats = statSync(archive);
            tar.t({
                file: archive,
                onentry: (entry) => {
                    if(entry.header.type === constants.DIRECTORY) {
                        return;
                    }
                    files.push(entry.header.path);
                },
                maxReadSize: bytesToMb(stats.size) + 16,
            }, undefined, (err) => {
                if (err) {
                    reject(err);
                }
                resolve(files);
            });
        } catch (err) {
            reject(err);
        }
    })
}

const bytesToMb = (bytes: number) => bytes / constants.ONE_MB;