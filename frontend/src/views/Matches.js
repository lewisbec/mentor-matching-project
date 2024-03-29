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

    fetch('https://api-dot-lithe-site-375901.uc.r.appspot.com/matches', reqOpts)
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
      <h2>Matches</h2>
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <h1>{serverData.length}</h1>
        </Col>
        <Col md>
          <h2>{user.nickname}</h2>
          <p className="lead text-muted">{user.email}</p>
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
