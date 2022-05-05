import { getRepoInfo, scanRepositories } from '@app/jobs/repository-scanner.process';
import { log } from '@config';
import { StatusError } from '@errors/status.error';
import { githubService } from '@service';
import { AppUtils } from '@utils';
import { Router } from 'express';
import { graphqlHTTP, OptionsData } from 'express-graphql';
import { buildSchema } from 'graphql';
import httpStatus from 'http-status';
import { join, sep } from 'path';

export const router = Router();


let schema = buildSchema(`

 type Mutation {
    startRepositoryScanning(token: String!): String
  }
    
  type Query {
      repositories(user: String!): [RepositoryShort!]!
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
    repositories: async ({ user }: any) => {
        const repoInfo = await getRepoInfo(user);
        return Object.keys(repoInfo).map(key => {
            const repository = repoInfo[key];
            return {
                name: repository.name,
                size: repository.size,
                owner: repository.owner,
            };
        });
    },
    repository: async ({ token, name, noCache }: any) => {
        const user = await githubService.getUser(token);
        const repoInfo = await getRepoInfo(user.login);
        let repository = repoInfo[name];
        return {
            name: repository.name,
            size: repository.size,
            owner: repository.owner,
            private: repository.private,
            activeWebHooks: repository.activeWebHooks,
            numberOfFiles: repository.numberOfFiles,
            files: async ({ pattern, random }: any) => {
                const path = await githubService.cloneRepository(token, user.login, name, noCache as boolean);
                const repositoryFiles = (await AppUtils.listArchiveFiles(path))[0];
                const reg = new RegExp(pattern);
                let match = repositoryFiles.filter((file) => reg.test(file));
                if (random) {
                    match = [match[Math.ceil(Math.random() * match.length)]];
                }
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
