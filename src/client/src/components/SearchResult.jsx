import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {IoChevronBack, IoChevronForward} from "react-icons/io5";

export default function SearchResult() {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [pageList, setPageList] = useState([]);
  const params = useParams();
  const keyword = params.keyword || "";

  async function getSearchResults() {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/searchRecipe/${keyword}`);
    return await res.json();
  }

  useEffect(() => {
    if (keyword !== "") {
      getSearchResults()
        .then((data) => {
          setResults(data);
          const maxPageNum = Math.ceil(data.results.length / 12);
          const tmpList = [];
          for (let i = 1; i <= maxPageNum; i++) {
            tmpList.push(i);
          }
          setPage(1);
          setPageList(tmpList);
        })
        .catch((error) => console.log(error));
    }
  }, [keyword]);

  return (
    <div className="container mt-5">
      <h5 style={{color: "black", fontWeight: "bold"}}>
        Search Results
        {results.results &&
          " (" + results.results.length.toString() + ")"}:{" "}
      </h5>
      <div>
        <div className={"row justify-content-center"}>
          {results.results &&
            results.results
              .slice((page - 1) * 12, page * 12)
              .map((result, i) => (
                <div key={i} className={"col"} style={{ flexGrow: 0 }}>
                  <div
                    className={"card zoom-hover"}
                    style={{
                      width: "15rem",
                      height: "18rem",
                      borderRadius: "20%",
                      margin: "13px 15px",
                      backgroundColor: "wheat",
                    }}
                  >
                    <div
                      className={"card-body text-center"}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <img
                        src={results.baseUri + result.image}
                        className={
                          "img-thumbnail rounded card-img-bottom my-auto mx-auto d-block"
                        }
                        alt={"img" + i.toString()}
                        style={{
                          width: "180px",
                          height: "180px",
                          objectFit: "cover",
                          textAlign: "center",
                        }}
                      />
                      <h6
                        className={"my-auto overflow-auto text-ellips"}
                        style={{ textAlign: "center", fontWeight: "bold" }}
                        title={result.title}
                      >
                        <Link to={"/details/" + result.id.toString()}>
                          {result.title}
                        </Link>
                      </h6>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
      <ul
        className={"list-group list-group-horizontal justify-content-center"}
        style={{ flexDirection: "row", marginTop: "50px" }}
      >
        {pageList[0] && page !== pageList[0] ? (
          <li className={"list-group-item"}>
            <span>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page - 1);
                }}
              >
                <IoChevronBack />
                Prev Page
              </a>
            </span>
          </li>
        ) : (
          ""
        )}

        <li className={"list-group-item"}>
          <span>Select Page: </span>
          <select
            name="pages"
            id="pages"
            onChange={(e) => setPage(parseInt(e.target.value))}
            style={{ marginLeft: "10px" }}
          >
            {pageList.map((curr_page) => (
              <option
                key={"page" + curr_page.toString()}
                value={curr_page}
                selected={page === curr_page}
              >
                {curr_page}
              </option>
            ))}
          </select>
        </li>

        {pageList[0] && page !== pageList[pageList.length - 1] ? (
          <li className={"list-group-item"}>
            <span>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                Next Page
                <IoChevronForward />
              </a>
            </span>
          </li>
        ) : (
          ""
        )}
      </ul>
    </div>
  );
}
