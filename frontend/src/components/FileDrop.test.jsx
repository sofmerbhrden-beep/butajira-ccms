import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileDrop from "./FileDrop.jsx";

describe("FileDrop Component", () => {
  it("renders correctly with basic props", () => {
    render(<FileDrop label="Test Label" required={true} onChange={() => {}} />);
    expect(screen.getByText(/Test Label/)).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Browse")).toBeInTheDocument();
  });

  it("does not render camera button when allowCamera is false", () => {
    render(<FileDrop label="Test Label" allowCamera={false} onChange={() => {}} />);
    expect(screen.queryByText("Take Photo")).not.toBeInTheDocument();
  });

  it("renders camera button when allowCamera is true", () => {
    render(<FileDrop label="Test Label" allowCamera={true} onChange={() => {}} />);
    expect(screen.getByText("Take Photo")).toBeInTheDocument();
  });

  it("calls onChange when a file is selected", () => {
    const mockOnChange = jest.fn();
    render(<FileDrop label="Test Label" onChange={mockOnChange} />);
    
    // In jsdom, file inputs are a bit tricky, we select it by type
    // Since there are two inputs when allowCamera is true, we test basic upload first
    const input = document.querySelector("input[type='file']");
    const file = new File(["dummy content"], "example.png", { type: "image/png" });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnChange).toHaveBeenCalledWith(file);
  });
});
