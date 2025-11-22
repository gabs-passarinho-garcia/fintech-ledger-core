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
    mock.restore();
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

    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Tenants")).toBeDefined();
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

    expect(screen.getByText("Users")).toBeDefined();
    expect(screen.getByText("Profiles")).toBeDefined();
    expect(screen.getByText("All Tenants")).toBeDefined();
    expect(screen.getByText("All Ledgers")).toBeDefined();
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

    expect(screen.queryByText("Users")).toBeNull();
    expect(screen.queryByText("Profiles")).toBeNull();
    expect(screen.queryByText("All Tenants")).toBeNull();
    expect(screen.queryByText("All Ledgers")).toBeNull();
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

    expect(screen.getByText("testuser")).toBeDefined();
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

    expect(screen.getByText("Test Content")).toBeDefined();
  });
});
