import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
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
});
