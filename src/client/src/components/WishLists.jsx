import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateWishlist from "./CreateWishlist";
import EditWishlist from "./EditWishlist";
import { useAuthToken } from "../AuthTokenContext";

export default function WishLists() {
  const [wishlists, setWishlists] = useState([]);
  const [createMode, setCreateMode] = useState(false);
  const [editMode, setEditMode] = useState([]);
  const [count, setCount] = useState(0);
  const { accessToken } = useAuthToken();

  const changeToFalse = (i) => {
    const temp = editMode.slice();
    temp[i] = false;
    setEditMode(temp);
  };

  const changeToTrue = (i) => {
    const temp = editMode.slice();
    temp[i] = true;
    setEditMode(temp);
  };

  const changeCreate = () => {
    setCreateMode(false);
  };

  const countNum = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    async function getWishlists() {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      const user_wishlist = data.wishlist;
      if (user_wishlist) {
        setWishlists(user_wishlist);
      }
    }
    if (accessToken) {
      getWishlists();
    }
  }, [count, accessToken]);

  useEffect(() => {
    const length = wishlists.length;
    const temp = [];
    for (let i = 0; i < length; i += 1) {
      temp.push(false);
    }
    setEditMode(temp);
  }, [wishlists]);

  const deleteWishlist = (wishlistId) => {
    fetch(`${process.env.REACT_APP_API_URL}/wishlist/${wishlistId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Successfully deleted " + data.title);
        countNum();
      })
      .catch((error) => {
        alert("Operation failed!");
        console.error("Error:", error);
        countNum();
      });
  };

  return (
    <div>
      <h1 style={{textAlign:"center", marginTop:"60px", marginBottom: "30px", color: "black", fontWeight: "bolder", fontSize: "3rem"}}>My Favorite Recipe Boxes</h1>
      {accessToken && wishlists.length !== 0 ? (
          <div style={{height: "90px"}}>
            <div style={{textAlign:"right", marginRight: "30px"}}>
              {createMode ? (
                  <div>
                    <CreateWishlist
                        changeCreate={changeCreate}
                        accessToken={accessToken}
                        countNum={countNum}
                    />
                  </div>
              ) : (
                  <div>
                    <button className="btn " style={{backgroundColor:"#FFE9B5"}} onClick={() => setCreateMode(true)}>Create New Recipe List</button>
                  </div>
              )}
            </div>
          </div>
      ) : ("")}
      <div>
        {accessToken && wishlists.length === 0 ? (
            <div>
              <div style={{height: "90px"}}/>
              <h2 style={{textAlign: "center"}}>Oops!<br/>You haven't created any recipe boxes yet!</h2>
              <div style={{height: "90px"}}>
                <div style={{textAlign:"center"}}>
                  {createMode ? (
                      <div>
                        <CreateWishlist
                            changeCreate={changeCreate}
                            accessToken={accessToken}
                            countNum={countNum}
                        />
                      </div>
                  ) : (
                      <div>
                        <button className="btn " style={{backgroundColor:"#FFE9B5"}} onClick={() => setCreateMode(true)}>Create New Recipe List</button>
                      </div>
                  )}
                </div>
              </div>
            </div>
        ) : (
            ""
        )}
        <div className={"row justify-content-center"}>
          {wishlists.map((wishlist, i) => (
            <div className="wishlist-row-li" key={wishlist.id} style={{flexGrow: 0}}>
              <div className={"card zoom-hover Green50"} 
                style={{
                  width: "15rem", height: "18rem",
                  borderRadius: "20%", margin: "13px 15px", backgroundColor: "wheat"
                }}>
                <div className={"card-body"}
                  style={{display: "flex", flexDirection: "column", justifyContent: "space-evenly"}}>
                    <div style={{position: "relative"}}>
                      <img
                        src={wishlist.imageURL}
                        className={"img-thumbnail round card-img-bottom my-auto mx-auto d-block"}
                        alt={wishlist.title}
                        style={{
                          width: "180px", height: "180px", objectFit: "cover",
                          textAlign: "center"
                      }}/>
                      <div className={"zoom-hover-half"}
                        style={{position: 'absolute', right:"-1%", top:"-10%", cursor: "pointer"}} onClick={(e) => {
                          e.preventDefault();
                          deleteWishlist(wishlist.id);
                        }
                      }>
                        <img 
                          src="/imgs/crytomato.png" 
                          alt="crying tomato" 
                          style={{width: "45px", height: "45px"}} 
                          title="Delete" />
                      </div>
                    </div>
                  

                  <div>
                    {editMode[i] ? (
                      <div>
                        <EditWishlist
                          wishlistId={wishlist.id}
                          changeToFalse={() => changeToFalse(i)}
                          countNum={countNum}
                        />
                      </div>
                    ) : (
                      <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                        <h6 
                          className={"my-auto overflow-auto text-ellips"} 
                          style={{textAlign: "center", fontWeight: "bold"}} 
                          title={wishlist.title}>
                            <Link to={`/wishlist/${wishlist.id}`}>
                              { wishlist.title }
                            </Link>
                        </h6>
                        <div
                          style={{ cursor: "pointer", marginLeft: "10px"}}
                          onClick={() => changeToTrue(i)}
                        >
                          <img 
                            className="zoom-hover-half" 
                            src="/imgs/carrot.png" 
                            alt="editing carrot" 
                            style={{width: "20px", height: "30px"}} 
                            title="Rename"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
