import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import "../style/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const signUp = () => loginWithRedirect({ screen_hint: "signup" });

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
          <div className="card border-0 shadow rounded-3 my-5">
            <div className="card-body p-4 p-sm-5">
              <h5 className="card-title text-center mb-5 fw-light fs-5">
                Sign In
              </h5>
              <div className="d-grid">
                <div className="text-center mb-2">
                  {!isAuthenticated ? (
                    <button
                      className="btn btn-outline-primary btn-block btn-login text-uppercase fw-bold"
                      type="submit"
                      onClick={loginWithRedirect}
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-block btn-login text-uppercase fw-bold"
                      type="submit"
                      onClick={() => navigate("/")}
                    >
                      Enter App
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <button
                    className="btn btn-outline-primary btn-block btn-login text-uppercase fw-bold"
                    type="submit"
                    onClick={signUp}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
