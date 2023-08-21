import React from "react";
import {useNavigate} from "react-router-dom";

export default function SearchBar() {
    const [query, setQuery] = React.useState("");
    const navigate = useNavigate();

    const onSubmit = (e) => {
        e.preventDefault();
        if (query !== "") {
            navigate("/search/" + query);
        }
    }

    return (
        <form className={"form-inline"} action="/" method="get">
            <label htmlFor="header-search">
            </label>
            <div className={"row"} style={{flexWrap: "nowrap"}}>
                <input
                    type="text"
                    id="header-search"
                    className={"form-control mr-sm-2"}
                    style={{marginRight: "0.5rem"}}
                    placeholder="Enter recipe name"
                    name="search"
                    value={query || ""}
                    onChange={event => setQuery(event.target.value)}
                />
                <button className={"btn btn-outline-success my-2 my-sm-0"} type="submit" onClick={onSubmit}>Search</button>
            </div>
        </form>
    );
}