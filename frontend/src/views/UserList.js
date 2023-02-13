import React, { useEffect, useState } from "react";
import { Container, Row } from "reactstrap";

import Highlight from "../components/Highlight";

export const UserlistComponent = () => {
  var serverData, setServerData = useState(null);

  function setServerData(){
    //Temp to fix errors in CI
  }
  // https://create-react-app.dev/docs/proxying-api-requests-in-development/
  useEffect(() => {
    fetch('/api/users')
    .then(response => {
      if(response.ok) {
        console.log(response);
        return response.body;
      }
      throw response;
    })
    .then(data => {
      setServerData(data);
    }).catch(error => {
      console.error("Error retrieving user data: " + error);
    })
  }, []);
  return (
    <Container className="mb-5">
      <Row>
        User List
      </Row>
      <Row>
        <Highlight>{JSON.stringify(serverData, null, 2)}</Highlight>
      </Row>
    </Container>
  );
};

export default UserlistComponent;
