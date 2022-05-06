import { Repository } from '@app/dto/repository';
import { log } from '@config';
import { constants } from '@constants';
import { properties } from '@properties';
import { githubService } from '@service';
import { AppUtils } from '@utils';
import async, { AsyncResultCallback, AsyncResultIterator } from 'async';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';


export const getRepoInfo = async (user: string): Promise<Record<string, any>> => {
    log.info('reading repository info %s', user);
    const path = getRepoInfoPath(user);
    if (existsSync(path)) {
        return readFile(path, {
            encoding: constants.UTF_8,
        }).then((file) => {
            return JSON.parse(file);
        });
    }
    return {};
}

export const scanRepositories = async (user: string, noCache: boolean, repositories: Repository[]) => {
    async.concatLimit<Repository, any>(repositories, properties.git.maxParallerProcess, (repository, callback) => {
        return scanRepository(repository, noCache, callback);
    }, async (err, result) => {
        if (err) {
            log.error('failed to scan repositories of %s', user);
            log.error(err);
            return;
        }
        log.info('successfully scanned repositories of %s', user);
        if (!result) {
            return;
        }
        const existing = await getRepoInfo(user);
        for (let repository of result) {
            if (!repository) {
                continue;
            }
            existing[repository.name as string] = repository;
            log.info('completed processing repository %s of user %s', repository.name, user);
        }
        await writeFile(getRepoInfoPath(user), JSON.stringify(existing, undefined, ' '), {
            encoding: constants.UTF_8,
        });
    });
};

const scanRepository = async (repository: Repository, noCache: boolean, callback: AsyncResultCallback<any>) => {
    log.info('scanning %s repository of user %s', repository.meta.name, repository.user);
    const path = await githubService.cloneRepository(repository.token, repository.user, repository.meta.name, noCache);
    let [repositoryFiles, size] = await AppUtils.listArchiveFiles(path);
    return callback(null, {
        name: repository.meta.name,
        owner: repository.meta.owner.login,
        private: repository.meta.private,
        size: size,
        activeWebHooks: (await githubService.getRepoWebHooks(repository.token, repository.user, repository.meta.name))
            .filter((hook) => hook.active)
            .map((hook) => ({
                name: hook.name,
                url: hook.config.url,
            })),
        numberOfFiles: repositoryFiles.length,
    });
}


const getRepoInfoPath = (user: string) => resolve(constants.TEMP_DIR, `${user}-repo-info.json`);