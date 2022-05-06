import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { History } from "../history";
import "./index.css";
import { useSearchParams } from "react-router-dom";

export const Repositorylist = () => {
  const [refresher, setRefresher] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const [token, setToken] = useState(
    searchParams.get("token") ? `${searchParams.get("token")}` : ``
  );
  const [userName, setUserName] = useState("");

  const TRIGGER_FETCH = gql`
    mutation StartRepositoryScanning($token: String!) {
      startRepositoryScanning(token: $token)
    }
  `;

  const [mutateFunction, { data, loading, error }] = useMutation(TRIGGER_FETCH);
  useEffect(() => {
    if (data) {
      setUserName(data.startRepositoryScanning);
    }
  }, [data]);

  const ListRepositories = (refresher: any) => {
    const { loading, error, data } = useQuery(gql`
        {
            repositories(user: "${userName}"){
              name,
              size,
              owner
            }
          }
        `);
    if (loading) return <div className="repo-list-container">Loading...</div>;
    if (error) return <div className="repo-list-container">Error :(</div>;

    return (
      <>
        <table>
          <tr>
            <th className="table-heading">OWNER</th>
            <th className="table-heading">NAME</th>
            <th className="table-heading">SIZE</th>
            <th className="table-heading">ACTION</th>
          </tr>
          {data.repositories.map(
            (item: {
              size: string;
              owner: number;
              name: string;
              index: number;
            }) => (
              <tbody key={item.index}>
                <td className="table-body">{item.owner}</td>
                <td className="table-body">{item.name}</td>
                <td className="table-body">{item.size}b</td>
                <td className="table-body">
                  <button
                    onClick={() =>
                      History.navigate(
                        `/repository-details?repoName=${item.name}&token=${token}`
                      )
                    }
                  >
                    Details&nbsp;&gt;&gt;&gt;
                  </button>
                </td>
              </tbody>
            )
          )}
        </table>
      </>
    );
  };

  const onInputChange = (e: any) => {
    const token = e.target.value;
    setToken(token);
    setSearchParams({ token });
  };
  return (
    <div className="repo-list-container">
      {" "}
      <h2>Github Scanner 🚀</h2>
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>
        <input
          className="input"
          placeholder="Github Personal access token"
          onChange={(e) => onInputChange(e)}
          value={token}
        ></input>
        <button
          type="submit"
          onClick={() => mutateFunction({ variables: { token } })}
        >
          Start Repository Scan
        </button>
        {userName && (
          <button type="submit" onClick={() => setRefresher(refresher + 1)}>
            Fetch Repositories
          </button>
        )}
      </form>
      {loading && <div className="repo-list-container">Loading...</div>}
      {error && <div className="repo-list-container">Error :(</div>}
      {userName && <ListRepositories refresher={refresher} />}
    </div>
  );
};
