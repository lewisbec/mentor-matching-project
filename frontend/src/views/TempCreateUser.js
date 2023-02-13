import React from "react";
import {useHistory} from 'react-router-dom';
import "../stylesheets/questions.css";

export const CreateUser = () => {
    const routerHistory = useHistory();

    function handleSubmit(e){
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        fetch('localhost:8080/users', {method: form.method, body: formData});
        console.log(Object.fromEntries(formData.entries()));
        routerHistory.push('/userlist');
    }
    //add_user(req.body.name, req.body.email, req.body.user_id)
    return (
        <>
        <h1>Temporary User Creation</h1>
        <hr />
        <form method="post" onSubmit={handleSubmit}>
            <label>
                Name: <input name="name"/>
            </label>
            <br/>
            <label>
                Email: <input type="email" name="email"/>
            </label>
            <br/>
            <label>
                User ID: <input  name="user_id"/>
            </label>
            <br/>
            <hr/>
            <button type="submit">Submit</button>
        </form>
        </>
    );

}

export default CreateUser;