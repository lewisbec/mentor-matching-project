import React, {useEffect, useState} from "react";
import { Container, Row, Col } from "reactstrap";
import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const ProfileComponent = () => {
  const { user } = useAuth0();
  const [serverData, setServerData] = useState("");

  useEffect(() => {
    const reqOpts = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({user_id: user.user_id})
    };
    fetch('/get', reqOpts)
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
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={user.picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
        </Col>
      </Row>
      <Row className="align-items-top mb-5 text-top text-md-left">
        <Col md={4}>
          <label>Name</label>
          <label>Email</label>
          <label>Email Verified?</label>
        </Col>
        <Col md>
          <label> {user.nickname}</label>
          <label> {user.email}</label>
          <label> {user.email_verified} </label>
        </Col>
      </Row>
      
      <Row>
        <Highlight>{JSON.stringify(user, null, 2)}</Highlight>
      </Row>
      <Row>
        <Highlight>{JSON.stringify(serverData, null, 2)}</Highlight>
      </Row>

    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
