import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import {useAuthToken} from "../AuthTokenContext";

const list = ["Appetizers and Snacks", "Bread Recipes", "Breakfast and Brunch", "Desserts", "Dinner Recipe",
    "Drinks", "Everyday", "Fruit", "Lunch Recipes"];

export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth0();
    const { accessToken } = useAuthToken();
    const [userFav, setUserFav] = useState([]);
    const [communityPicks, setCommunityPicks] = useState([]);

    useEffect(() => {
        async function getUser() {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await res.json();
            if (data) {
                let reviews = data.review;
                reviews.sort((a, b) => -(a.rating - b.rating));
                if (reviews.length > 8) {
                    reviews = reviews.slice(0, 8);
                }
                const products = []
                for (let i = 0; i < reviews.length; i++) {
                    products.push(reviews[i].product);
                }
                setUserFav(products);
            }
        }
        if (accessToken) {
            getUser();
        }
    }, [accessToken]);

    useEffect(() => {
        async function getCommunityPicks() {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/communityPicks`);
            const data = await res.json();
            return data;
        }
        getCommunityPicks().then(data => {
            setCommunityPicks(data);
        }).catch(error => console.log(error));
    }, []);

    async function getRandomRecipe() {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/getRandomRecipe`);
        const data = await res.json();
        return data;
    }

    const handleRandomRecipe = (e) => {
        e.preventDefault();
        getRandomRecipe().then(data => {
            navigate("/details/" + data.recipes[0].id);
        }).catch(error => console.log(error));
    };

    const getName = (i) => {
        if (i === 'Fruit') {
            return 'Fruits and Vegatables'
        } else if (i === 'Everyday') {
            return 'Everyday Cookings'
        } else {
            return i;
        }
    }

    return (
        <div>
            <div className="row" style={{justifyContent: "space-evenly", marginTop: "20px"}}>
                {list.map((i, index) => (
                    <Link key={i} to={"/search/" + i}>
                        <div key={index} style={{width: "70px"}}>
                            <img src={`/imgs/${index + 1}.png`} alt={i} style={{width: "70px", borderRadius: "50%"}}/>
                            <h6 style={{textAlign: "center", marginTop: "10px"}}>{getName(i)}</h6>

                        </div>
                    </Link>
                ))}
            </div>
            {isAuthenticated ? (
                <div style={{marginTop: "30px"}}>
                    <h3>Your Highest Rated Recipes: </h3>
                    <div style={{marginTop: "30px"}}>
                        {userFav.length === 0 ? (
                            <h4 style={{textAlign: "center"}}>
                                Your highest rated recipes will be shown here.
                            </h4>
                        ) : ("")}
                        <div className={"row justify-content-center"}>
                            {userFav.map(item => (
                                <div key={"user" + item.externalId} className={"col"} style={{flexGrow: 0}}>
                                    <div className={"card zoom-hover"} style={{
                                        width: "15rem", height: "18rem",
                                        borderRadius: "20%", margin: "13px 15px", backgroundColor: "wheat"
                                    }}>
                                        <div className={"card-body text-center"}
                                             style={{display: "flex", flexDirection: "column",
                                                 justifyContent: "space-between"}}>
                                            <img
                                                src={item.imageURL}
                                                className={"img-thumbnail rounded card-img-bottom my-auto mx-auto d-block"}
                                                alt={item.productName}
                                                style={{
                                                    width: "180px", height: "180px", objectFit: "cover",
                                                    textAlign: "center"
                                                }}
                                            />
                                            <h6 className={"my-auto overflow-auto text-ellips"}
                                                style={{textAlign: "center", fontWeight: "bold"}}
                                                title={item.productName}>
                                                <Link to={"/details/" + item.externalId.toString()}>
                                                    {item.productName}
                                                </Link>
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : ("")}
            <div style={{marginTop: "50px"}}>
                <h3>Community Picks: </h3>
                <div style={{marginTop: "30px"}}>
                    <div className={"row justify-content-center"}>
                        {communityPicks.map(item => (
                            <div key={"community" + item.externalId} className={"col"} style={{flexGrow: 0}}>
                                <div className={"card zoom-hover"} style={{
                                    width: "15rem", height: "18rem",
                                    borderRadius: "20%", margin: "13px 15px", backgroundColor: "wheat"
                                }}>
                                    <div className={"card-body text-center"}
                                         style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                                        <img
                                            src={item.imageURL}
                                            className={"img-thumbnail rounded card-img-bottom my-auto mx-auto d-block"}
                                            alt={item.productName}
                                            style={{
                                                width: "180px", height: "180px", objectFit: "cover",
                                                textAlign: "center"
                                            }}
                                        />
                                        <h6 className={"my-auto overflow-auto text-ellips"}
                                            style={{textAlign: "center", fontWeight: "bold"}}
                                            title={item.productName}>
                                            <Link to={"/details/" + item.externalId.toString()}>
                                                {item.productName}
                                            </Link>
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{height: "50px"}}></div>
            <div style={{display: "flex", flexDirection: "column"}}>
                <div style={{textAlign: "center"}}>
                    <h3>Still Don't know what to eat?</h3>
                </div>
                <div style={{textAlign: "center"}}>
                    <button className={"btn btn-warning"}
                            style={{width: "300px"}}
                            onClick={handleRandomRecipe}>Get a Random Recipe!</button>
                </div>
            </div>
            <div style={{height: "50px"}}></div>
        </div>
    );
}
