import { useCallback, useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { Product, ProductListParams } from "@/types/product";

export function useProductList(params: ProductListParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await productService.list(params);
      setProducts(data.items);
      setTotalPages(data.totalPages);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, status, error, totalPages, reload: load };
}
