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


const request = <T>(token: string, config: AxiosRequestConfig) => axios.request<T>({
    ...config,
    baseURL: properties.git.baseUrl,
    headers: {
        Authroization: `token ${token}`,
        ...config.headers
    },
});