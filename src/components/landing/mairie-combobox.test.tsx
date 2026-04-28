import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MairieCombobox, type Mairie } from "./mairie-combobox";

const sampleResults: Mairie[] = [
  { i: "69001", n: "Lyon", cp: "69001", e: "mairie@lyon.fr", t: "04 72 10 30 30" },
  { i: "69232", n: "Lyon-en-Beaujolais", cp: "69620", e: "lyonbj@example.fr", t: null },
];

function mockFetchResolved(results: Mairie[]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MairieCombobox — debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not call the API when fewer than 2 characters are typed", async () => {
    const fetchMock = mockFetchResolved([]);
    vi.stubGlobal("fetch", fetchMock);

    render(<MairieCombobox onSelect={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "l" } });

    await vi.advanceTimersByTimeAsync(500);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("debounces the API call (waits 200ms after last keystroke)", async () => {
    const fetchMock = mockFetchResolved(sampleResults);
    vi.stubGlobal("fetch", fetchMock);

    render(<MairieCombobox onSelect={() => {}} />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "ly" } });

    await vi.advanceTimersByTimeAsync(150);
    expect(fetchMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("q=ly"),
      expect.any(Object)
    );
  });
});

describe("MairieCombobox — rendering & selection", () => {
  // Use real timers so testing-library's waitFor can poll naturally.
  it("renders results returned by the API", async () => {
    vi.stubGlobal("fetch", mockFetchResolved(sampleResults));

    render(<MairieCombobox onSelect={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "lyon" } });

    expect(await screen.findByText("Lyon")).toBeInTheDocument();
    expect(screen.getByText("Lyon-en-Beaujolais")).toBeInTheDocument();
  });

  it("calls onSelect with the chosen mairie when a result is clicked", async () => {
    vi.stubGlobal("fetch", mockFetchResolved(sampleResults));
    const onSelect = vi.fn();

    render(<MairieCombobox onSelect={onSelect} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "lyon" } });

    const option = await screen.findByText("Lyon");
    fireEvent.click(option);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(sampleResults[0]);
  });

  it("shows a fallback link to lannuaire.service-public.fr when no result is found", async () => {
    vi.stubGlobal("fetch", mockFetchResolved([]));

    render(<MairieCombobox onSelect={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "zzzz" } });

    await waitFor(() =>
      expect(
        screen.getByText(/lannuaire\.service-public\.fr/i)
      ).toBeInTheDocument()
    );
  });
});
