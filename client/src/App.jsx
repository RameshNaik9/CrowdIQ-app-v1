import React, { useEffect, useState } from "react";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from "./components/GoogleLogin";

function App() {
    const [user, setUser] = useState();

    useEffect(() => {
        console.log("Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
    }, []);

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div className="App">
                <GoogleLogin setUser={setUser}></GoogleLogin>
                {user && user.name}
                {user && user.email}
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;