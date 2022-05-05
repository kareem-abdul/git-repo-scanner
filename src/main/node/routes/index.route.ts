import { StatusError } from '@errors/status.error';
import { githubService } from '@service';
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
        const repository = await githubService.getUserRepo(token, user.login, name);
        return {
            name: repository.name,
            size: repository.size,
            owner: repository.owner.login,
            private: repository.private,
            activeWebHooks: async () => {
                return (await githubService.getRepoWebHooks(token, user.login, name))
                    .filter((hook) => hook.active)
                    .map((hook) => ({
                        name: hook.name,
                        url: hook.config.url,
                    }));
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
