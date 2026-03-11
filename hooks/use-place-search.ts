import { useState, useEffect, useRef } from "react";
import type { LocationType } from "@/lib/enums";
import type { PlacePrediction } from "@/types";
import { fetchPlacePredictions } from "@/services/api-handler";

export function usePlaceSearch(input: string, locationType: LocationType) {
  const [predictions, setPredictions] = useState<
    ReadonlyArray<PlacePrediction>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(
      () => {
        if (input.length < 2) {
          setPredictions([]);
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        fetchPlacePredictions(input, locationType)
          .then((res) => {
            setPredictions(res.predictions);
          })
          .catch(() => {
            setPredictions([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      },
      input.length < 2 ? 0 : 300,
    );

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [input, locationType]);

  const clearPredictions = () => {
    setPredictions([]);
  };

  return { predictions, isLoading, clearPredictions };
}
