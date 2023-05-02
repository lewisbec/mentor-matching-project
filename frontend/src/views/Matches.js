import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import User from '../components/User'

export const MatchesComponent = () => {
  const { user } = useAuth0();
  const [serverData, setServerData] = useState([]);

  useEffect(() => {
    const reqOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.email })
    };
    fetch('/matches', reqOpts)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(data => {

        console.log(data)
        setServerData(data);
      }).catch(error => {
        console.error("Error retrieving user data: " + error);
      })
  }, []);

  return (
    <Container className="mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col>
          <h1>Your Matches</h1>
        </Col>
      </Row>
      {serverData.map((data) => (
        <Row key={data.name_input} className="mb-3">
          <Col>
            <User data={data} />
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default withAuthenticationRequired(MatchesComponent, {
  onRedirecting: () => <Loading />,
});
