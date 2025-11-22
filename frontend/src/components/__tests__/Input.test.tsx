import { describe, it, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import Input from "../Input";

describe("Input", () => {
  it("should render input with label", () => {
    render(<Input label="Username" name="username" />);
    expect(screen.getByLabelText("Username")).toBeDefined();
  });

  it("should render input with error message", () => {
    render(<Input name="username" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeDefined();
  });

  it("should render input with helper text", () => {
    render(<Input name="username" helperText="Enter your username" />);
    expect(screen.getByText("Enter your username")).toBeDefined();
  });

  it("should apply error styling when error is present", () => {
    render(<Input name="username" error="Error" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
  });
});
