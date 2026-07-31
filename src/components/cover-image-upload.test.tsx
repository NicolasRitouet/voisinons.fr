import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/actions/upload", () => ({
  createUploadTicket: vi.fn().mockResolvedValue("9999999999999.deadbeef"),
}));

import { CoverImageUpload } from "./cover-image-upload";

const TOO_LARGE_MESSAGE =
  "Image trop volumineuse (4 Mo max). Pensez à la compresser avant de la téléverser.";

function makeFile(sizeBytes: number, name = "photo.jpg", type = "image/jpeg") {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function getFileInput(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CoverImageUpload", () => {
  it("rejette les fichiers > 4 Mo sans appel réseau", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    const tooBig = makeFile(5 * 1024 * 1024);
    fireEvent.change(getFileInput(container), { target: { files: [tooBig] } });

    expect(onError).toHaveBeenCalledWith(TOO_LARGE_MESSAGE);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("accepte un fichier exactement à 4 Mo (limite inclusive)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: "https://blob.example/exact-4mb.jpg" }),
      })
    );

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    const exactLimit = makeFile(4 * 1024 * 1024);
    fireEvent.change(getFileInput(container), {
      target: { files: [exactLimit] },
    });

    await waitFor(() =>
      expect(onUploaded).toHaveBeenCalledWith("https://blob.example/exact-4mb.jpg")
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it("appelle onUploaded avec l'URL en cas de succès", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: "https://blob.example/abc.jpg" }),
      })
    );

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile(1024)] },
    });

    await waitFor(() =>
      expect(onUploaded).toHaveBeenCalledWith("https://blob.example/abc.jpg")
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it("traduit un 413 texte brut (Vercel FUNCTION_PAYLOAD_TOO_LARGE) en message lisible", async () => {
    // Vercel renvoie du texte brut, pas du JSON, sur cette erreur plateforme.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => {
          throw new SyntaxError("Unexpected token 'R'");
        },
      })
    );

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile(1024)] },
    });

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(TOO_LARGE_MESSAGE)
    );
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("propage le message d'erreur JSON renvoyé par l'API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Format non supporté" }),
      })
    );

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile(1024)] },
    });

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Format non supporté")
    );
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("ne crash pas sur une réponse non-JSON (ex. 502 HTML) et affiche un fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError("Unexpected token '<'");
        },
      })
    );

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile(1024)] },
    });

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Erreur d'upload")
    );
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("traite comme une erreur une réponse 200 sans champ url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      })
    );

    const onUploaded = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <CoverImageUpload onUploaded={onUploaded} onError={onError} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile(1024)] },
    });

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Erreur d'upload")
    );
    expect(onUploaded).not.toHaveBeenCalled();
  });

  describe("credentials sent to /api/upload", () => {
    function stubOkFetch() {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: "https://blob.example/cover.jpg" }),
      });
      vi.stubGlobal("fetch", fetchMock);
      return fetchMock;
    }

    async function uploadedBody(fetchMock: ReturnType<typeof vi.fn>) {
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      return fetchMock.mock.calls[0][1].body as FormData;
    }

    it("sends a signed ticket when creating a party (no slug yet)", async () => {
      const fetchMock = stubOkFetch();
      const { container } = render(
        <CoverImageUpload onUploaded={vi.fn()} onError={vi.fn()} />
      );

      fireEvent.change(getFileInput(container), {
        target: { files: [makeFile(1024)] },
      });

      const body = await uploadedBody(fetchMock);
      expect(body.get("ticket")).toBe("9999999999999.deadbeef");
      expect(body.get("slug")).toBeNull();
    });

    it("sends the slug when editing, so the admin cookie authorizes it", async () => {
      const fetchMock = stubOkFetch();
      const { container } = render(
        <CoverImageUpload
          partySlug="rue-jaboulay-lyon"
          onUploaded={vi.fn()}
          onError={vi.fn()}
        />
      );

      fireEvent.change(getFileInput(container), {
        target: { files: [makeFile(1024)] },
      });

      const body = await uploadedBody(fetchMock);
      expect(body.get("slug")).toBe("rue-jaboulay-lyon");
      expect(body.get("ticket")).toBeNull();
    });
  });
});
