import React, {useState, useEffect} from "react";
import logo from "../assets/logo.svg";

const Hero = () => {
  const [serverData, setServerData] = useState("");

  useEffect(() => {
    fetch("/test")
    .then(response => {
      if(response.ok) {
        return response.text();
      }
      throw response;
    })
    .then(data => {
      //console.log(data.getReader().read);
      setServerData(data);
      
    }).catch(error => {
      console.error("Error retrieving user data: " + error);
    })
  })

  return (
    <div className="text-center hero my-5">
      <img className="mb-3 app-logo" src={logo} alt="React logo" width="120" />
      <h1 className="mb-4">Mentor Matching Website</h1>
      <p className="lead">
        Test landing page for the Mentor Matching Website.
      </p>
      <h2>Backend Connection Test</h2>
      <p>
        {serverData}
      </p>
    </div>
  );
}
export default Hero;
