import React from "react";
import ReactDOM from "react-dom";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";

const exampleClassName = css`
  background-color: green;
`;

const ExampleDiv = styled.div`
  border: 1px solid yellow;
  border-radius: 3px;
  color: red;
`;

function Hello() {
  return <ExampleDiv className={exampleClassName}>Hello webpack</ExampleDiv>;
}

ReactDOM.render(<Hello />, document.getElementById("main"));
