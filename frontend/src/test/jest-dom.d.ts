/**
 * Type definitions for jest-dom matchers in Bun test environment
 */
import "@testing-library/jest-dom";

declare module "bun:test" {
  interface Matchers<T> {
    toBeInTheDocument(): T;
    toHaveClass(className: string): T;
    toHaveTextContent(text: string | RegExp): T;
    toBeVisible(): T;
    toBeDisabled(): T;
    toBeEnabled(): T;
    toBeRequired(): T;
    toBeInvalid(): T;
    toBeValid(): T;
    toHaveValue(value: string | number | string[]): T;
    toHaveAttribute(attr: string, value?: string): T;
    toHaveFocus(): T;
    toBeChecked(): T;
    toBePartiallyChecked(): T;
    toHaveAccessibleDescription(description: string | RegExp): T;
    toHaveAccessibleName(name: string | RegExp): T;
    toHaveDescription(description: string | RegExp): T;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): T;
    toHaveFormValues(values: Record<string, unknown>): T;
    toHaveStyle(css: string | Record<string, unknown>): T;
    toBeEmptyDOMElement(): T;
    toContainElement(element: HTMLElement | null): T;
    toContainHTML(html: string): T;
    toHaveAccessibleErrorMessage(message: string | RegExp): T;
    toHaveAccessibleErrorMessage(): T;
    toHaveErrorMessage(message: string | RegExp): T;
    toHaveErrorMessage(): T;
  }
}
