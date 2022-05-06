import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { History } from "../history";

export const RepositoryDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const repoName = searchParams.get("repoName");
  const token = searchParams.get("token");

  const { loading, error, data } = useQuery(gql`
    {
        repository(token:"${token}",name:"${repoName}"){
            name,
            size,
            owner,
            private,  
            numberOfFiles,
            activeWebHooks{name,url},
            files(
              random: true
            ) {
              name
              url
              contentBase64
            }
          }
      }
      `);
  if (loading) return <div className="repo-details-container">Loading...</div>;
  if (error) return <div className="repo-details-container">Error :(</div>;

  return (
    <>
      <button
        type="submit"
        className="back-button"
        onClick={() => History.navigate(`/`)}
      >
        &lt; &lt;&nbsp;Go Back
      </button>
      {data && (
        <div className="repo-details-container">
          <h2>Owner Name : {data?.repository?.owner}</h2>
          <h4>Repository Name : {data?.repository?.name}</h4>
          <h4>Repo Size : {data?.repository?.size}b</h4>
          <h4>Number Of Files : {data?.repository?.numberOfFiles}</h4>
          
          <h4>
            File Link :<a href={data?.repository?.files[0]?.url}>click here</a>
          </h4>

          <b>{data?.repository.private ? "PRIVATE" : "PUBLIC"}</b>
          {data.repository?.activeWebHooks?.length > 0 && (
            <table>
              <tr>
                <th className="table-heading">NAME</th>
                <th className="table-heading">URL</th>
              </tr>
              {data.repository?.activeWebHooks?.map(
                (item: { url: string; name: string; index: number }) => (
                  <tbody key={item.index}>
                    <td className="table-body">{item.name}</td>
                    <td className="table-body">{item.url}</td>
                  </tbody>
                )
              )}
            </table>
          )}
        </div>
      )}
    </>
  );
};
