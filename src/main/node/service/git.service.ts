import { log } from '@config';
import { properties } from '@properties';
import axios, { AxiosRequestConfig } from 'axios';

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


const request = <T>(token: string, config: AxiosRequestConfig) => axios.request<T>({
    ...config,
    baseURL: properties.git.baseUrl,
    headers: {
        Authorization: `token ${token}`,
        ...config.headers
    },
});