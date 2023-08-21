import { render, screen } from "@testing-library/react";
import React from "react";
import NotFound from "../components/NotFound";
import '@testing-library/jest-dom/extend-expect';

test("renders Not Found copy", () => {
    render( < NotFound /> );
    expect(screen.getByText("404")).toBeInTheDocument();
});
