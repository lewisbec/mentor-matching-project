import React from "react";

const User = ({ data }) => {
    return (
        <div>
            <h2>{data.name_input}</h2>
            <p>Interests: {data.interests_input_1}, {data.interests_input_2}, {data.interests_input_3}</p>
            <p>Professional Interests: {data.prof_interests_input_1}, {data.prof_interests_input_2}, {data.prof_interests_input_3}</p>
            <p>Match Score: {data.score}</p>
            <p>Contact: {data.contact_method_input}</p>
        </div>
    )
}

export default User;