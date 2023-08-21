import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {Auth0Provider, useAuth0} from "@auth0/auth0-react";
import {AuthTokenProvider} from "./AuthTokenContext";
import Home from "./components/Home";
import AppLayout from "./components/AppLayout";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import ProductDetail from "./components/ProductDetail";
import NotFound from "./components/NotFound";
import SearchResult from "./components/SearchResult";
import WishList from "./components/WishList";
import WishLists from "./components/WishLists";
import VerifyUser from "./components/VerifyUser";
import AuthDebugger from "./components/AuthDebugger";
import Reviews from "./components/Reviews";

import "./style/index.css";

function RequireAuth({children}) {
    const {isAuthenticated, isLoading} = useAuth0();
    if (!isLoading && !isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    return children;
}

ReactDOM.render(
    <React.StrictMode>
        <Auth0Provider
            domain={process.env.REACT_APP_AUTH0_DOMAIN}
            clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
            redirectUri={`${window.location.origin}/verify-user`}
            audience={process.env.REACT_APP_AUTH0_AUDIENCE}
            cacheLocation="localstorage"
        >
            <AuthTokenProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/verify-user" element={<VerifyUser/>}/>
                        <Route path="" element={<AppLayout/>}>
                            <Route index element={<Home/>}/>
                            <Route path="login" element={<Login/>}/>
                            <Route path="search" element={<SearchResult/>}/>
                            <Route path="search/:keyword" element={<SearchResult/>}/>
                            <Route path="details/:productId" element={<ProductDetail/>}/>

                            <Route
                                path="profile"
                                element={
                                    <RequireAuth>
                                        <UserProfile/>
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="debugger"
                                element={
                                    <RequireAuth>
                                        <AuthDebugger/>
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="wishlists"
                                element={
                                    <RequireAuth>
                                        <WishLists/>
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="reviews"
                                element={
                                    <RequireAuth>
                                        <Reviews/>
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="wishlist/:wishlistId"
                                element={
                                    <RequireAuth>
                                        <WishList/>
                                    </RequireAuth>
                                }
                            />
                            <Route path="*" element={<NotFound/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthTokenProvider>
        </Auth0Provider>
    </React.StrictMode>,
    document.getElementById("root")
);
