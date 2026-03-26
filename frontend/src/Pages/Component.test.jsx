import { render, screen } from "@testing-library/react";
import Component from "./Component";

describe("Component page", () => {
  it("renders the form shell", () => {
    render(<Component />);

    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("TaskID")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /assign task/i })).toBeInTheDocument();
  });
});
