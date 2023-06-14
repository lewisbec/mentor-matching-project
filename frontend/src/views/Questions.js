import React, { useState, useEffect } from "react";
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
  const [showDemographicQuestions, setShowDemographicQuestions] = useState(false);
  const [userData, setUserData] = useState({});

  function handleMentorSelect(e) {
    setShowMentorQuestions(e.target.value === "mentor" || e.target.value === "both");
  }

  function handleDemographicSelect(e) {
    setShowDemographicQuestions(e.target.checked === true);
  }

  useEffect(() => {
    async function fetchUserData() {
      const reqOpts = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      const res = await fetch(`/users/${user.email}`, reqOpts);
      let data = await res.json();
      data = await JSON.parse(data.questions);
      setUserData(data);
    }
    fetchUserData();
  }, [])

  // From https://beta.reactjs.org/reference/react-dom/components/input#displaying-inputs-of-different-types
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    var formObj = Object.fromEntries(formData);
    let race_input = "";
    for(let i = 1; i < 8; i++) {
      if (formObj["race_input" + i] !== undefined){
        race_input += formObj["race_input" + i] + ", ";
        delete formObj["race_input" + i];
      }
    }
    formObj["race_input"] = race_input.slice(0, -2);
    const reqOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.email, questions: JSON.stringify(Object.fromEntries(formData)), type: formData.get("mentor_input") })
    };
    fetch('/users', reqOpts)
    alert("Survey Responses Submitted!\nYou can now use the matching page.");
  }

  /*
  Categories and questions:
    1. General Information
      - Name
      - Mentor (Checkbox, be a mentor, find a mentor, both?) - "I would like to be a " with checkboxes?
      - Job Title (Can be N/A)
      - Academic Standing
      - Participate in Matching?
      - Would you like demographic information to be used during matching?
    2. Professional Topics / Technical Topics
      - Experience - Drop down (Student, Advanced Student, Graduate, Less than 5 years)
      - Place of employment (If applicable) 
    3. Mentor Only Questions
      - Currently interested in working with a student team in a senior design project in the near future?
      - Preferred Method of Contact
      - Professional Associations you belong to
      - Top 3 skills/areas of experience you feel confident in helping others with
    4. Demographic Information
      - Gender Identity
      - Racial Identity (US Census categories)
        + White Alone
        + Black or African American Alone
        + Asian Alone
        + Native Hawaiian and Other Pacific Islander alone
        + Hispanic or Latino 
        + Another Race alone
        + Two or more Races
  */
  return (
    <>
      <form method="post" onSubmit={handleSubmit}>
        <h1>Instructions</h1>
        <hr />
        <p>For all fields in the form below, please enter up to 100 characters per field. You may include any terms that are most relevant to you. Our matching system will sort them for you.</p>
        <br />
        <h1>General Information</h1>
        <hr />
        <label>Name:<input name="name_input" defaultValue={userData.name_input} /></label>
        <br />
        <label>Mentor:<select name="mentor_input" onChange={handleMentorSelect}>
          <option value=""></option>
          <option value="mentee">Mentee</option>
          <option value="mentor">Mentor</option>
          <option value="both">Both</option>
        </select></label>
        <br /><br />
        Please note that by selecting “Participate in Matching?” you confirm your agreement to allow your contact information to be shared with mentees after admin approval.
        <br /><br />
        <label>
          Participate in Matching? <input type="checkbox" value="matching" />
        </label>
        <br /> <br />
        For matching purposes, demographic information may help us match you with someone who has also provided demographic information and is looking for a mentor/mentee who shares their identie(s).
        <br /> <br />
        <label>Use Demographic Information for matching:
          <input type="checkbox" name="useDemographic_input" value="true" onClick={handleDemographicSelect} />

        </label>
        <hr /> <br /> <br />
        <h1>Topics of Discussion</h1>
        <hr />
        <label>
          <em>Use the slider to specify how important a topic is to you.</em>
          <em></em>
        </label>
        <label> Technical Interests:
          <input name="interests_input_1" defaultValue={userData.interests_input_1} />
          <input type="range" name="interests_input_1_rank" min="1" max="5" defaultValue="3" />
          <input name="interests_input_2" defaultValue={userData.interests_input_2} />
          <input type="range" name="interests_input_2_rank" min="1" max="5" defaultValue="3" />
          <input name="interests_input_3" defaultValue={userData.interests_input_3} />
          <input type="range" name="interests_input_3_rank" min="1" max="5" defaultValue="3" />
        </label>
        <br />
        <label> Professional Interests:
          <input name="prof_interests_input_1" defaultValue={userData.prof_interests_input_1} />
          <input type="range" name="prof_interests_input_1_rank" min="1" max="5" defaultValue="3" />
          <input name="prof_interests_input_2" defaultValue={userData.prof_interests_input_2} />
          <input type="range" name="prof_interests_input_2_rank" min="1" max="5" defaultValue="3" />
          <input name="prof_interests_input_3" defaultValue={userData.prof_interests_input_3} />
          <input type="range" name="prof_interests_input_3_rank" min="1" max="5" defaultValue="3" />
        </label>
        <br /><br />
        <br />
        <label>
          Experience:
          <select name="skill_input">
            <option value="blank"></option>
            <option value="novice">Student</option>
            <option value="advanced_beginner">Advanced Student</option>
            <option value="competent">Graduate</option>
            <option value="proficient">Less than 5 Years</option>
            <option value="expert">More than 5 Years</option>
          </select>
        </label>
        <label>
          Place of Employment (If applicable)
          <input name="employment_input" defaultValue={userData.employment_input} />
        </label>

        <hr /> <br /> <br />

        {showMentorQuestions && (
          <div id="mentor_questions_container">
            <hr />
            <h2> Mentor Only Questions</h2>
            <p>Are you interested in working with a student team in a senior design project in the near future?</p>
            <label><select name="design_project">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select></label><br /><br />
            <label>
              Top 3 areas of expertise you would feel confident in helping others with:
              < br />
              <input name="expertise_input_1" defaultValue={userData.expertise_input_1} />
              < br />
              <input name="expertise_input_2" defaultValue={userData.expertise_input_2} />
              < br />
              <input name="expertise_input_3" defaultValue={userData.expertise_input_3} />
            </label>
            <br />
            <label>Professional Association:<input name="association_input" defaultValue={userData.association_input} /></label>
            <br /> <br />
            <em>This field will be shown to potential mentees to provide a way to reach out to you.</em> <br />
            <label>Contact Method:<input name="contact_method_input" defaultValue={userData.contact_method_input} /></label>
          </div>

        )}
        {showDemographicQuestions && (
          <div id="mentor_questions_container">
            <hr />
            <h1>Demographic Information</h1>
            <label>
              Gender Identity: <input name="gender_input" />
              <input type="range" name="gender_input_rank" min="1" max="5" defaultValue="3" />
            </label>
            <br /> <br />
            <label>
              Do you identify as a member of the LGBTQ+ community? <input name="lgbtq" type="checkbox" value="LGBTQ+"/>
            </label>
             <br /> <br />
            <label>
            <em>Choose all that apply.</em>
            <em></em>
            </label>
            <br />
            <label>Racial Identity:</label> <br />
            <input name="race_input1" type="checkbox" id="asian" value="asian"/>
            <label htmlFor="asian">Asian</label> <br />
            <input name="race_input2" type="checkbox" id="black" value="black"/>
            <label htmlFor="black">Black or African American</label><br />
            <input name="race_input3" type="checkbox" id="hispanic" value="hispanic"/>
            <label htmlFor="hispanic">Hispanic or Latino</label><br />
            <input name="race_input4" type="checkbox" id="hawaiian" value="hawaiian"/>
            <label htmlFor="hawaiian">Native Hawaiian and Other Pacific Islander</label><br />
            <input name="race_input5" type="checkbox" id="white" value="white"/>
            <label htmlFor="white">White</label><br />
            <input name="race_input6" type="checkbox" id="other" value="other"/>
            <label htmlFor="other">Other</label><br />
            <input name="race_input7" type="checkbox" id="NA" value="NA"/>
            <label htmlFor="NA">Prefer not to Answer</label><br />
            <label><input type="range" name="race_input_rank" min="1" max="5" defaultValue="3" /></label>
            <br />

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
