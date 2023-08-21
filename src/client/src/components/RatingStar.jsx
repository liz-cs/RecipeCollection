import React from "react";

export default function RatingStar({ rating, setRating }) {
    return (
        <div className={"rating justify-content-end"}>
            <input type="radio" name="rating" value={5} id={"5"} checked={rating === 5}
                   onChange={() => {
                       setRating(5);
                   }}/> <label htmlFor="5">☆</label>
            <input type="radio" name="rating" value={4} id={"4"} checked={rating === 4}
                   onChange={() => {
                       setRating(4);
                   }}/> <label htmlFor="4">☆</label>
            <input type="radio" name="rating" value={3} id={"3"} checked={rating === 3}
                   onChange={() => {
                       setRating(3);
                   }}/> <label htmlFor="3">☆</label>
            <input type="radio" name="rating" value={2} id={"2"} checked={rating === 2}
                   onChange={() => {
                       setRating(2);
                   }}/> <label htmlFor="2">☆</label>
            <input type="radio" name="rating" value={1} id={"1"} checked={rating === 1}
                   onChange={() => {
                       setRating(1);
                   }}/> <label htmlFor="1">☆</label>
        </div>
    );
}