import React, { useState, useEffect } from "react";
import { Container, Row } from "reactstrap";

import Highlight from "../components/Highlight";

export const UserlistComponent = () => {
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/users')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(data => {
        setServerData(data);
      })
      .catch(error => {
        console.error("Error retrieving user data: " + error);
      });
  }, []);

  return (
    <Container className="mb-5">
      <Row>User List</Row>
      <Row>
        <Highlight>{JSON.stringify(serverData, null, 2)}</Highlight>
      </Row>
    </Container>
  );
};

export default UserlistComponent;
