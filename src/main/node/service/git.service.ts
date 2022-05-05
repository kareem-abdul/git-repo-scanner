import { log } from '@config';
import { constants } from '@constants';
import { properties } from '@properties';
import axios, { AxiosRequestConfig } from 'axios';
import { existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { resolve } from 'path';

export const getUser = async (token: string) => {
    log.info('getting github user info');
    return request<any>(token, {
        url: '/user',
    }).then((res) => res.data);
};

export const getUserRepos = async (token: string, user: string) => {
    log.info('getting repositories of user %s', user);
    return request<any[]>(token, {
        url: `/users/${user}/repos`,
    }).then((res) => res.data);
};

export const getUserRepo = async (token: string, user: string, repo: string) => {
    log.info('getting user %s repo %s', user, repo);
    return request<any>(token, {
        url: `/repos/${user}/${repo}`,
    }).then((res) => res.data);
}

export const getRepoWebHooks = async (token: string, user: string, repo: string) => {
    log.info('getting hooks of repo %s of user %s', repo, user);
    return request<any[]>(token, {
        url: `/repos/${user}/${repo}/hooks`
    }).then((res) => res.data || []);
};

export const getRepositoryContents = async (token: string, user: string, repo: string, path: string = '') => {
    log.info('getting contents of the repo %s at path %s', repo, path);
    return request<any[]>(token, {
        url: `/repos/${user}/${repo}/contents/${path}`
    }).then((res) => res.data || []);
}

export const cloneRepository = async (token: string, user: string, repo: string, noCache: boolean = false) => {
    log.info('cloning repository %s of user %s', repo, user);
    const fileName = `${user}-${repo}.tar.gz`;
    const path = resolve(constants.TEMP_DIR, fileName);
    if(!noCache) {
        log.debug('checking repository in cache')
        if(existsSync(path)) {
            log.verbose('repository exists on cache')
            return path;
        }
    } else {
        await unlink(path);
    }
    return request<any>(token, {
        url: `/repos/${user}/${repo}/tarball`,
        responseType: 'arraybuffer',
    }).then(async (response) => {
        log.debug('saving %s to tmp directory %s', fileName, constants.TEMP_DIR);
        if (!existsSync(constants.TEMP_DIR)) {
            log.verbose('making temp dir %s', constants.TEMP_DIR);
            await mkdir(constants.TEMP_DIR);
        }
        await writeFile(path, response.data, {
            encoding: constants.UTF_8,
        });
        log.debug('file %s saved', path);
        return path;
    });
};

const request = <T>(token: string, config: AxiosRequestConfig) => axios.request<T>({
    ...config,
    baseURL: properties.git.baseUrl,
    headers: {
        Authorization: `token ${token}`,
        ...config.headers
    },
});