import { StatusError } from '@errors/status.error';
import { githubService } from '@service';
import { AppUtils } from '@utils';
import { Router } from 'express';
import { graphqlHTTP, OptionsData } from 'express-graphql';
import { buildSchema } from 'graphql';
import httpStatus from 'http-status';

export const router = Router();


let schema = buildSchema(`
  type Query {
      repositories(token: String!): [RepositoryShort!]!
      repository(token: String!, name: String!): Repository!
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
      activeWebHooks: [WebHook!]!
  }

  type WebHook {
      name: String!
      url: String!
  }
`);

var root = {
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
    repository: async ({ token, name }: any) => {
        const user = await githubService.getUser(token);
        let repository: any;
        let repositoryFiles: any[];
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
                if (!repositoryFiles) {
                    const path = await githubService.cloneRepository(token, user.login, name);
                    repositoryFiles = await AppUtils.listArchiveFiles(path);
                }
                return repositoryFiles.length;
            },
        }
    },
};

router.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
} as OptionsData));

router.use((req, res, next) => next(new StatusError(httpStatus.NOT_FOUND, 'not found')));
