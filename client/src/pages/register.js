import { useContext, useState } from "react";
import { authContext } from "../context/auth-context";
import { useForm } from "../hooks/useForm";
import { useMutation } from "@apollo/react-hooks";

import { TextField, Button, Container, Stack, Alert } from "@mui/material";

import { gql } from "graphql-tag";
import { useNavigate } from "react-router-dom";

const REGISTER_USER = gql`
  mutation Mutation($registerInput: RegisterInput) {
    registerUser(registerInput: $registerInput) {
      email
      username
      token
    }
  }
`;

const Register = () => {
  const context = useContext(authContext);
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  const registerUserCallback = () => {
    console.log("callback hit");
    registerUser();
  };

  const { onChange, onSubmit, values } = useForm(registerUserCallback, {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update(proxy, { data: { registerUser: userData } }) {
      context.login(userData);
      navigate("/");
    },
    onError({ graphQLErrors }) {
      setErrors(graphQLErrors);
    },
    variables: { registerInput: values },
  });

  return (
    <Container spacing={2} maxWidth="sm">
      <h3>Register</h3>
      <p>This is the register page, register below to create an account!</p>

      <Stack spacing={2} paddingBottom={2}>
        <TextField label="Username" name="username" onChange={onChange} />
        <TextField label="Email" name="email" onChange={onChange} />
        <TextField label="Password" name="password" onChange={onChange} />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          onChange={onChange}
        />
      </Stack>
      {errors.map((err) => {
        return <Alert severity="error">{err.message}</Alert>;
      })}
      <Button variant="contained" onClick={onSubmit}>Register</Button>
    </Container>
  );
};

export default Register;
