import React from "react";
import "../stylesheets/questions.css";
import Loading from "../components/Loading";

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const Questions = () => {
  const { user } = useAuth0();
  const { qs } = fetch("/questions",
    {
        method: 'GET',
    }).then((response) => response.json())

    /*
      Next steps:
      1. Check if user exists in our database
        1.1. Populate Questions with responses if they do
        1.2. Keep everything blank if they don't
      2. Upon completing the survey, add user to our database with their auth0 ID
        2.1. If user already exists, make sure to call the proper endpoint
    */


    // From https://beta.reactjs.org/reference/react-dom/components/input#displaying-inputs-of-different-types
    function handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const reqOpts = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: user.user_id, questions: formData.json, type: formData.get("mentor_input")})
      };
      fetch('/users', reqOpts)
    }

    /*
    Questions List:
    Name
    Gender
    Racial Identity? (Ask about correct way to word this question)
    Interests/Area of Expertise
    Experience (Qualifications)
    Skill Level (Novice/Advanced Beginner/Competent/Proficient/Expert) - Based on Dreyfus model
    Additional Information you want to share

    Mentor Only:
    Currently interested in working with a student team in a senior design project in the near future?
    Professional Association
    Preferred Method of Contact
    */
  return (
    <>
      <form method="post" onSubmit={handleSubmit}>
        <h1>General Information</h1>
        <hr />
        <label>Name:<input name="name_input"/></label>
        <br />
        <label>Gender:<input name="gender_input"/></label>
        <br />
        <label>Gender:<input name="mentor_input"/></label>
        <hr /> <br /> <br />
        <h1>Area of Interest</h1>
        <hr />
        <label>
          Interests: <input name="interests_input_1"/>
          <br/>
          <input name="interests_input_2"/>
          <br/>
          <input name="interests_input_3"/>
        </label>
        <br/>
        <hr />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default withAuthenticationRequired(Questions, {
  onRedirecting: () => <Loading />,
});
