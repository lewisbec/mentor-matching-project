import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";

import Highlight from "../components/Highlight";

export const UserlistComponent = () => {
  var serverData, setServerData = useState(null);

  useEffect(() => {
    fetch('localhost:8080/users')
    .then(response => {
      if(response.ok) {
        return response.json();
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
