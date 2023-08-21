import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import { Link, useOutletContext } from "react-router-dom";

import "../style/profile.css";

export default function Profile() {
  const { user } = useAuth0();
  const [name, setName] = useOutletContext();
  const [editMode, setEditMode] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const { accessToken } = useAuthToken();

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
        // setUserName(data.name);
        setName(data.name);
        setWishlistCount(data.wishlist.length);
        setReviewCount(data.review.length);
      }
    }

    if (accessToken) {
      getUser();
    }
  }, [accessToken, editMode]);

  function EditName() {
    const onSubmit = () => {
      const data = {
        newName: document.getElementById("newName").value,
      };
      if (data.newName.length < 20 || data.newName.length > 1) {
        fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data === null) {
              alert("Duplicate name detected");
            } else {
              // setUserName(data.name);
              setName(data.name);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        alert("name can only be 1-10 characters");
      }
    };

    return (
      <div className="input-group">
        <input
          id="newName"
          type="text"
          className="form-control"
          placeholder="new username"
          aria-label="new username"
          aria-describedby="basic-addon2"
          maxLength="20"
          minLength="1"
          required
        />
        <div className="input-group-append">
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              setEditMode(false);
            }}
          >
            Cancel
          </button>
          <button className="btn btn-outline-primary" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card">
        <div className="top-container ml-2">
          <img
            src={user.picture}
            className="img-fluid profile-image"
            width="100"
            alt="profile"
          />
        </div>
        <div className="ml-2">
          <div className="name" style={{marginBottom: "16px"}}>
            {name}{" "}
            {editMode ? (
              <div>
                <EditName />
              </div>
            ) : (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setEditMode(true)}
              >
                Edit Name
              </button>
            )}
          </div>
          <p className="mail">📧 Email: {user.email}</p>
          <p>✅ Email Verified: {user.email_verified.toString()}</p>
          <div className="recipe-border pt-2">
            <Link to="/wishlists" className="recipe">
              My Favorites ({wishlistCount})
            </Link>
          </div>
          <div className="pt-2">
            <Link to="/reviews" className="recipe">
              My Reviews ({reviewCount})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
