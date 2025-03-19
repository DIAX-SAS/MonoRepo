import * as React from 'react';
import '@testing-library/jest-dom'; 
import { render } from "@testing-library/react";
import Head from "../head";

describe("Head Component", () => {
  it("renders the correct metadata", async () => {
    render(<Head />);

    // Ensure next/head updates the DOM
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.title).toBe("Diax");

    const metaDescription = document.querySelector("meta[name='description']");
    expect(metaDescription).toHaveAttribute("content", "Application of DIAX SAS");

    const metaCharset = document.querySelector("meta[charset]");
    expect(metaCharset).toHaveAttribute("charset", "utf-8");

    const metaViewport = document.querySelector("meta[name='viewport']");
    expect(metaViewport).toHaveAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
  });
});
