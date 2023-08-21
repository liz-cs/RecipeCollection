import { render, screen } from "@testing-library/react";
import * as React from "react";
import SearchBar from "../components/SearchBar";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => {
        return mockUseNavigate;
    },
}));

test("renders search button", () => {
  render(<SearchBar />);
  expect(screen.getByText("Search")).toBeInTheDocument();
});

const stateSetter = jest.fn();
jest
  .spyOn(React, "useState")
  .mockImplementation((stateValue) => [(stateValue = "burger"), stateSetter]);

test("enter search button navigates to search/object", () => {
  render(<SearchBar />);

  const enterSearchButton = screen.getByText("Search");
  const inputBox = screen.getByPlaceholderText("Enter recipe name");
  userEvent.type(inputBox, "burger");
  userEvent.click(enterSearchButton);

  expect(mockUseNavigate).toHaveBeenCalledWith("/search/burger");
});
