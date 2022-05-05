import { StatusError } from '@errors/status.error';
import { githubService } from '@service';
import { AppUtils } from '@utils';
import { Router } from 'express';
import { graphqlHTTP, OptionsData } from 'express-graphql';
import { buildSchema } from 'graphql';
import httpStatus from 'http-status';
import { basename, join, sep } from 'path';

export const router = Router();


let schema = buildSchema(`

 type Mutation {
    startRepositoryScanning(token: String!): String
  }
    
  type Query {
      repositories(token: String!): [RepositoryShort!]!
      repository(token: String!, name: String!, noCache: Boolean = false): Repository!
  }

  type RepositoryShort {
      name: String!
      size: Int!
      owner: String!
  }

  type Repository {
      name: String!
      size: Int!
      owner: String!
      private: Boolean!
      numberOfFiles: Int!
      files(pattern: String = "^.*yml$", random: Boolean = false): [File!]!
      activeWebHooks: [WebHook!]!
  }

  type File {
      name: String!
      url: String!
      contentBase64: String!
  }

  type WebHook {
      name: String!
      url: String!
  }
`);

var root = {
    startRepositoryScanning: async ({ token }: any) => {
        return 'lijukrks166'
    },
    repositories: async ({ token }: any) => {
        const user = await githubService.getUser(token);
        return githubService.getUserRepos(token, user.login)
            .then(repositories => repositories.map(
                repository => ({
                    name: repository.name,
                    size: repository.size,
                    owner: repository.owner.login,
                })
            ));
    },
    repository: async ({ token, name, noCache }: any) => {
        const user = await githubService.getUser(token);
        let repository: any;
        let repositoryFiles: string[];
        return {
            name: async () => {
                if (!repository) {
                    repository = await githubService.getUserRepo(token, user.login, name)
                }
                return repository.name;
            },
            size: async () => {
                if (!repository) {
                    repository = await githubService.getUserRepo(token, user.login, name)
                }
                return repository.size;
            },
            owner: async () => {
                if (!repository) {
                    repository = await githubService.getUserRepo(token, user.login, name)
                }
                return repository.owner.login;
            },
            private: async () => {
                if (!repository) {
                    repository = await githubService.getUserRepo(token, user.login, name)
                }
                return repository.private;
            },
            activeWebHooks: async () => {
                return (await githubService.getRepoWebHooks(token, user.login, name))
                    .filter((hook) => hook.active)
                    .map((hook) => ({
                        name: hook.name,
                        url: hook.config.url,
                    }));
            },
            numberOfFiles: async () => {
                const path = await githubService.cloneRepository(token, user.login, name, noCache as boolean);
                if (!repositoryFiles) {
                    repositoryFiles = await AppUtils.listArchiveFiles(path);
                }
                return repositoryFiles.length;
            },
            files: async ({ pattern, random }: any) => {
                const path = await githubService.cloneRepository(token, user.login, name, noCache as boolean);
                if (!repositoryFiles) {
                    repositoryFiles = await AppUtils.listArchiveFiles(path);
                }
                const reg = new RegExp(pattern);
                let match = repositoryFiles.filter((file) => reg.test(file));
                if(random) {
                    match = [match[Math.ceil(Math.random() * match.length)]];
                }
                console.log(match);
                return match.map(async (file) => {
                    const parts = file.split(sep);
                    parts.shift();
                    const filePath = join(...parts);
                    const repositoryFile = (await githubService.getRepositoryContents(token, user.login, name, filePath)) as any;
                    return {
                        name: filePath,
                        url: repositoryFile.download_url,
                        contentBase64: repositoryFile.content
                    };
                });
            }
        }
    },
};

router.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
} as OptionsData));

router.use((req, res, next) => next(new StatusError(httpStatus.NOT_FOUND, 'not found')));
