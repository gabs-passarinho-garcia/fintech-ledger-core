import { describe, it, expect, beforeEach, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "../Layout";

// Mock useAuth hook
const mockUseAuth = mock();

mock.module("../../hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

describe("Layout", () => {
  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>,
    );
  };

  it("should render navigation links", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        username: "testuser",
        createdAt: new Date(),
        isMaster: false,
      },
      signOut: mock(),
      isAuthenticated: true,
      isLoading: false,
      signIn: mock(),
      signUp: mock(),
      error: null,
      isMaster: false,
    });

    renderLayout();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Tenants")).toBeInTheDocument();
  });

  it("should show admin links when user is master", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        username: "admin",
        createdAt: new Date(),
        isMaster: true,
      },
      signOut: mock(),
      isAuthenticated: true,
      isLoading: false,
      signIn: mock(),
      signUp: mock(),
      error: null,
      isMaster: true,
    });

    renderLayout();

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Profiles")).toBeInTheDocument();
    expect(screen.getByText("All Tenants")).toBeInTheDocument();
    expect(screen.getByText("All Ledgers")).toBeInTheDocument();
  });

  it("should not show admin links when user is not master", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        username: "user",
        createdAt: new Date(),
        isMaster: false,
      },
      signOut: mock(),
      isAuthenticated: true,
      isLoading: false,
      signIn: mock(),
      signUp: mock(),
      error: null,
      isMaster: false,
    });

    renderLayout();

    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Profiles")).not.toBeInTheDocument();
    expect(screen.queryByText("All Tenants")).not.toBeInTheDocument();
    expect(screen.queryByText("All Ledgers")).not.toBeInTheDocument();
  });

  it("should display username", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        username: "testuser",
        createdAt: new Date(),
        isMaster: false,
      },
      signOut: mock(),
      isAuthenticated: true,
      isLoading: false,
      signIn: mock(),
      signUp: mock(),
      error: null,
      isMaster: false,
    });

    renderLayout();

    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("should render children content", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        username: "testuser",
        createdAt: new Date(),
        isMaster: false,
      },
      signOut: mock(),
      isAuthenticated: true,
      isLoading: false,
      signIn: mock(),
      signUp: mock(),
      error: null,
      isMaster: false,
    });

    renderLayout();

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
