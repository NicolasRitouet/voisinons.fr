import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, createEvent, waitFor } from "@testing-library/react";
import { AddressAutocomplete } from "./address-autocomplete";

function apiFeature(name: string, postcode: string, city: string) {
  return {
    properties: { label: `${name}, ${postcode} ${city}`, context: "", name, postcode, city, street: name },
    geometry: { coordinates: [4.83, 45.75] },
  };
}

const FEATURES = [
  apiFeature("15 Rue Jaboulay", "69007", "Lyon"),
  apiFeature("15 Rue Jaboulin", "69007", "Lyon"),
  apiFeature("15 Rue Jacquard", "69004", "Lyon"),
];

function stubFetch(features = FEATURES) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: async () => ({ features }) })
  );
}

/** Renders with the value wired up, the way the create form uses it. */
function renderCombobox(onSelect = vi.fn()) {
  let value = "";
  const onChange = vi.fn((next: string) => {
    value = next;
    rerender();
  });
  const { rerender: doRerender } = render(
    <AddressAutocomplete value={value} onChange={onChange} onSelect={onSelect} />
  );
  function rerender() {
    doRerender(
      <AddressAutocomplete value={value} onChange={onChange} onSelect={onSelect} />
    );
  }
  return { onChange, onSelect };
}

function combobox() {
  return screen.getByRole("combobox");
}

async function openSuggestions() {
  fireEvent.change(combobox(), { target: { value: "15 rue jab" } });
  await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
}

beforeEach(() => {
  stubFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AddressAutocomplete accessibility", () => {
  it("exposes the input as a combobox before anything is typed", () => {
    renderCombobox();

    const input = combobox();
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-controls");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("announces the suggestions as a labelled listbox of options", async () => {
    renderCombobox();
    await openSuggestions();

    const listbox = screen.getByRole("listbox");
    expect(combobox()).toHaveAttribute("aria-expanded", "true");
    expect(combobox().getAttribute("aria-controls")).toBe(listbox.id);
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "false");
  });

  // aria-expanded alone is only read when focus moves, so nothing would tell a
  // screen reader user that the list just appeared.
  it("announces how many addresses were found in a live region", async () => {
    renderCombobox();
    await openSuggestions();

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("3 adresses proposées");
    expect(status).toHaveTextContent(/flèches/i);
  });

  it("points aria-activedescendant at the highlighted option", async () => {
    renderCombobox();
    await openSuggestions();

    fireEvent.keyDown(combobox(), { key: "ArrowDown" });

    const options = screen.getAllByRole("option");
    expect(combobox()).toHaveAttribute("aria-activedescendant", options[0].id);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  // In an editable combobox these belong to the text cursor. Intercepting them
  // would stop a user from jumping to the start of the address being corrected.
  it.each(["Home", "End"])(
    "leaves %s to the text cursor instead of moving the active option",
    async (key) => {
      renderCombobox();
      await openSuggestions();

      fireEvent.keyDown(combobox(), { key: "ArrowDown" });
      const before = combobox().getAttribute("aria-activedescendant");

      const event = createEvent.keyDown(combobox(), { key });
      fireEvent(combobox(), event);

      expect(event.defaultPrevented).toBe(false);
      expect(combobox()).toHaveAttribute("aria-activedescendant", before!);
    }
  );

  it("selects the highlighted address on Enter", async () => {
    const onSelect = vi.fn();
    renderCombobox(onSelect);
    await openSuggestions();

    fireEvent.keyDown(combobox(), { key: "ArrowDown" });
    fireEvent.keyDown(combobox(), { key: "ArrowDown" });
    fireEvent.keyDown(combobox(), { key: "Enter" });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].name).toBe("15 Rue Jaboulin");
  });

  it("closes on Escape and reopens on ArrowDown", async () => {
    renderCombobox();
    await openSuggestions();

    fireEvent.keyDown(combobox(), { key: "Escape" });
    await waitFor(() =>
      expect(combobox()).toHaveAttribute("aria-expanded", "false")
    );
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.keyDown(combobox(), { key: "ArrowDown" });
    await waitFor(() =>
      expect(combobox()).toHaveAttribute("aria-expanded", "true")
    );
  });

  it("marks the busy state while the lookup is in flight", async () => {
    // Hold the response open so the in-flight window is observable.
    let release: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        pending.then(() => ({ json: async () => ({ features: FEATURES }) }))
      )
    );

    renderCombobox();
    fireEvent.change(combobox(), { target: { value: "15 rue jab" } });

    await waitFor(() => expect(combobox()).toHaveAttribute("aria-busy", "true"));

    release(null);
    await waitFor(() => expect(combobox()).not.toHaveAttribute("aria-busy"));
  });

  it("selects on mousedown so the blur cannot close the list first", async () => {
    const onSelect = vi.fn();
    renderCombobox(onSelect);
    await openSuggestions();

    fireEvent.mouseDown(screen.getAllByRole("option")[2]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].name).toBe("15 Rue Jacquard");
  });
});
