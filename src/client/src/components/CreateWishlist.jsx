import React, { useState} from 'react';
import { AiOutlineRollback } from "react-icons/ai";

export default function CreateWishlist({changeCreate, accessToken, countNum}) {
    const [wishlistName, setWishlistName] = useState("");
    
    const onSubmit=()=>{
        const data={
            "title" : wishlistName,
        };
        if (data.title.length>0){
            fetch(`${process.env.REACT_APP_API_URL}/wishlist`, {
                method: 'POST', 
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                })
                .then(response => response.json())
                .then(data => {
                    if (data === null) {
                        alert("Duplicate name detected");
                    }
                    changeCreate();
                    countNum();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }else{
                alert("Please Enter a Valid Name")
            }
        };
    
    return (
        <div>
            <div onClick={() => changeCreate()}  style={{ cursor: "pointer", marginLeft: "10px"}}>
                <AiOutlineRollback size={28} />
            </div>
            <input 
                value={wishlistName} 
                onChange={e=>setWishlistName(e.target.value)}
                maxLength="20"
                minLength="1"
                required
            />
            <button className="btn" style={{backgroundColor:"#FFE9B5"}} onClick={onSubmit}>Submit</button>
        </div>
    )
}
