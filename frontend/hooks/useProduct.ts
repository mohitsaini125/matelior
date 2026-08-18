import { useCallback, useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await productService.getById(id);
      setProduct(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, status, error, reload: load };
}
