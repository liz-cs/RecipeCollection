import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useAuthToken} from "../AuthTokenContext";
import {AiFillStar, AiOutlineStar} from "react-icons/ai";
import RatingStar from "./RatingStar";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(0);
    const [action, setAction] = useState(0);
    const {accessToken} = useAuthToken();

    const editReview = (i) => {
        setEditIndex(i);
    }

    const submitReview = (i) => {
        const id = reviews[i].id;
        const data = {
            content: editContent,
            rating: editRating,
        };
        fetch(`${process.env.REACT_APP_API_URL}/review/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === null) {
                    alert("This review does not exist!")
                }
                setEditIndex(null);
                setAction(action + 1);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    const deleteReview = (i) => {
        const id = reviews[i].id;
        fetch(`${process.env.REACT_APP_API_URL}/review/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === null) {
                    alert("This review does not exist!")
                }
                setEditIndex(null);
                setAction(action + 1);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    useEffect(() => {
        async function getReviews() {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await res.json();
            const user_review = data.review;
            user_review.sort((a, b) => -(new Date(a.updatedAt) - new Date(b.updatedAt)));
            if (user_review) {
                setReviews(user_review);
            }
        }

        if (accessToken) {
            getReviews();
        }
    }, [accessToken, action]);

    useEffect(() => {
        if (editIndex === null) {
            setEditRating(0);
            setEditContent("");
        }
        else {
            setEditRating(reviews[editIndex].rating);
            setEditContent(reviews[editIndex].content);
        }
    }, [editIndex])

    return (
        <div>
            <h1 style={{textAlign: "center", marginTop: "60px", marginBottom: "10px", color: "black", fontWeight: "bolder", fontSize: "3rem"}}>My Reviews</h1>
            <div style={{height: "90px"}}/>
            {accessToken && reviews.length === 0 ? (
                <h2 style={{textAlign: "center"}}>Oops!<br/>You haven't commented on any recipes yet!</h2>
            ) : (
                ""
            )}
            <div className={"list-group"}>
                {reviews.map((review, i) => (
                    <div key={i.toString()} className={"list-group-item opacity-25"}>
                        <div className={"reviews-row"}>
                            <div style={{paddingRight: "30px", paddingLeft: "30px", maxWidth: "500px"}}>
                                <img
                                    src={review.product.imageURL}
                                    className={"img-thumbnail  card-img-bottom mx-auto my-auto d-block reviews-element"}
                                    alt={"img" + i.toString()}
                                    style={{
                                        width: "180px", height: "180px", objectFit: "cover", borderRadius: "50%"
                                    }}
                                />
                            </div>
                            <div className={"reviews-element"} style={{maxWidth: "500px"}}>
                                <Link to={"/details/" + review.productId.toString()}>
                                    <h4 style={{fontWeight: "bold"}}>
                                        {review.product.productName}
                                    </h4>
                                </Link>
                                <h5 style={{marginTop: "20px", marginBottom:"20px"}}>{review.updatedAt.slice(0, 10)}{" "}
                                    {review.updatedAt.slice(12, 19)}</h5>
                                <div className={"reviews-element"} style={{display: "flex"}}>
                                    {editIndex === i ? (
                                        <RatingStar rating={editRating} setRating={setEditRating}/>
                                    ) : (
                                        <h5>{[1, 2, 3, 4, 5].map((num) => (
                                            <span key={"star" + num.toString()}>
                                                {review.rating >= num ? (<AiFillStar/>) : (<AiOutlineStar/>)}
                                            </span>
                                        ))}</h5>
                                    )}
                                </div>
                                
                                {editIndex === i ? (
                                    <form>
                                        <div className={"form-group"} style={{justifyContent: "start", display: "flex"}}>
                                            <label style={{margin: 0}} htmlFor="edit_review"/>
                                            <textarea name="edit_review"
                                                      id="edit_review"
                                                      className={"form-control"}
                                                      rows={5}
                                                      maxLength={10000}
                                                      value={editContent}
                                                      onChange={(e) => setEditContent(e.target.value)}
                                            />
                                        </div>
                                    </form>
                                ) : (
                                    review.content.split("\n").map((item, index) => (
                                        <blockquote key={"block" + item} className={"blockquote"}>
                                            <p key={index}>
                                                {item}
                                                <br />
                                            </p>
                                        </blockquote>
                                    )
                                ))}
                                <div className={"row reviews-element"} style={{maxWidth: "500px", flexWrap: "nowrap"}}>
                                    <div style={{marginRight: "30px", marginLeft: "16px"}}>
                                        <button className={"btn btn-outline-success"}
                                                style={{width: "70px"}}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (editIndex === i) {
                                                        submitReview(i);
                                                    }
                                                    else {
                                                        editReview(i);
                                                    }
                                                }}
                                        >
                                            {editIndex === i ? "Submit" : "Edit"}</button>
                                    </div>
                                    <div>
                                        <button className={"btn btn-outline-danger"}
                                                style={{width: "70px"}}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (editIndex === i) {
                                                        setEditIndex(null);
                                                    }
                                                    else {
                                                        if (window.confirm("Are you sure that you want to delete this review?")) {
                                                            deleteReview(i);
                                                        }
                                                    }
                                                }}
                                        >
                                            {editIndex === i ? "Cancel" : "Delete"}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}