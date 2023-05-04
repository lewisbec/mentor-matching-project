import React, { useState } from "react";
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

  const [showMentorQuestions, setShowMentorQuestions] = useState(false);

  function handleMentorSelect(e) {
    setShowMentorQuestions(e.target.value === "mentor");
  }


  // From https://beta.reactjs.org/reference/react-dom/components/input#displaying-inputs-of-different-types
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const reqOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.email, questions: JSON.stringify(Object.fromEntries(formData)), type: formData.get("mentor_input") })
    };
    fetch('/users', reqOpts)
    alert("Survey Responses Submitted!\nYou can now use the matching page.");
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
        <label>Name:<input name="name_input" /></label>
        <br />
        <label>Year in school (if applicable):<input grade="grade_input" /></label>
        <br />
        <label>Select one:</label>
        <br/>
        <input type="checkbox" id="mentor" name="mentor_input" value="mentor"/>
        <label for="mentor">Mentor</label>
        <br/>
        <input type="checkbox" id="mentee" name="mentor_input" value="mentee" />
        <label for="mentee">Mentee</label>
        <br/>
        <label>Mentor:<select name="mentor_input" onChange={handleMentorSelect}>
          <option value=""></option>
          <option value="mentee">Mentee</option>
          <option value="mentor">Mentor</option>
        </select></label>
        <hr /> <br /> <br />
        <h1>Area of Interest</h1>
        <hr />
        <label> Technical Interests: 
          <input name="tech_interests_input_1" />
          <input name="tech_interests_input_2" />
          <input name="tech_interests_input_3" />
        </label>
        <br />
        <label> Professional Interests: 
          <input name="prof_interests_input_1" />
          <input name="prof_interests_input_2" />
          <input name="prof_interests_input_3" />  </label>
        <br /><br />
        <label>
          Experience:
          <input name="experience_input" />
        </label>
        <br /><br />
        <label>
          Skill Level:
          <select name="skill_input">
            <option value="blank"></option>
            <option value="novice">Novice</option>
            <option value="advanced_beginner">Advanced Beginner</option>
            <option value="competent">Competent</option>
            <option value="proficient">Proficient</option>
            <option value="expert">Expert</option>
          </select>
        </label>
        <hr /> <br /> <br />
        <h1>Optional Demographics</h1>
        <hr />
        <label>
          Race:
          <select name="race_input">
            <option value="blank"></option>
            <option value="white">White</option>
            <option value="africanAmerican">Black or African American</option>
            <option value="asian">Asian</option>
            <option value="americanIndian">American Indian and Alaska Native</option>
            <option value="hawaiian">Native Hawaiian and Other Pacific Islander</option>
            <option value="other">Other</option>
            <option value="none">Prefer not to say</option>
          </select>
        </label>
        <br />
        <label> Gender: <input name="gender_input" /></label>
        <hr /><br />
        
        {showMentorQuestions && (

          <div id="mentor_questions_container">
            <h2> Mentor Only Questions</h2>
            <label>Are you interested in working with a student team in a senior design project in the near future?<select name="design_project">
              <option value="blank"></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select></label><br /><br />
            <label>Place of Employment (if applicable):<input name="employemnt_input" /></label>
            <br />
            <label>Other Professional Associations:<input name="association_input" /></label>
            <br />
            <label>Contact Method:<input name="contact_method_input" /></label>
          </div>

        )}

        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default withAuthenticationRequired(Questions, {
  onRedirecting: () => <Loading />,
});
