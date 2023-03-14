import React from "react";
import "../stylesheets/questions.css";
import Loading from "../components/Loading";

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const Questions = () => {
  const { user } = useAuth0();
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
        body: JSON.stringify({user_id: user.email, questions: JSON.stringify(Object.fromEntries(formData)), type: formData.get("mentor_input")})
      };
      fetch('/users', reqOpts)
    }

    /*function handleChange(e) {
      if(e.target.name === "mentor_input"){
        showMentorQuestions = e.target.value === "mentor"
        console.log(`Thing updated to ${showMentorQuestions}`)
      }
    }*/

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
        <label>Mentor:<select name="mentor_input"> 
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select></label>
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
        <br/><br/>
        <label>
          Experience:
          <input name="experience_input"/>
        </label>
        <br /><br/>
        <label>
          Skill Level: 
          <select name="skill_input"> 
          <option value="novice">Novice</option>
          <option value="advanced_beginner">Advanced Beginner</option>
          <option value="competent">Competent</option>
          <option value="proficient">Proficient</option>
          <option value="expert">Expert</option>
        </select>
        </label>
        <br /><hr />
        <h2> Mentor Only Questions</h2>
        <p>Are you interested in working with a student team in a senior design project in the near future?</p>
        <label>Interested?<select name="design_project"> 
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select></label><br /><br/>
        <label>Professional Association:<input name="association_input"/></label>
        <br />
        <label>Contact Method:<input name="contact_method_input"/></label>
        <hr />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default withAuthenticationRequired(Questions, {
  onRedirecting: () => <Loading />,
});
