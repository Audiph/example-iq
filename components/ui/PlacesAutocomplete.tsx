"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { LocationType } from "@/lib/enums";
import type { PlaceResult } from "@/types";
import { usePlaceSearch } from "@/hooks/use-place-search";

interface PlacesAutocompleteProps {
  label: string;
  value: string;
  locationType: LocationType;
  onPlaceSelect: (place: PlaceResult) => void;
  onClear: () => void;
  error?: string;
}

interface DropdownPosition {
  readonly top: number;
  readonly left: number;
  readonly width: number;
}

export default function PlacesAutocomplete({
  label,
  value,
  locationType,
  onPlaceSelect,
  onClear,
  error,
}: PlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUserInput, setIsUserInput] = useState(false);

  const { predictions, clearPredictions } = usePlaceSearch(
    searchQuery,
    locationType,
  );

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!isUserInput) {
      setInputValue(value);
    }
    setIsUserInput(false);
  }

  const [prevPredictions, setPrevPredictions] = useState(predictions);
  if (prevPredictions !== predictions) {
    setPrevPredictions(predictions);
    if (predictions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(-1);
    }
  }

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen || predictions.length === 0) return;

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, predictions, updatePosition]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const selectPrediction = useCallback(
    (index: number) => {
      const prediction = predictions[index];
      if (!prediction) return;
      setInputValue(prediction.description);
      setSearchQuery("");
      setIsOpen(false);
      clearPredictions();
      onPlaceSelect({
        address: prediction.description,
        placeId: prediction.placeId,
      });
    },
    [predictions, onPlaceSelect, clearPredictions],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchQuery(newValue);
    if (value) {
      setIsUserInput(true);
      onClear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : predictions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectPrediction(highlightedIndex);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const dropdown =
    isOpen && predictions.length > 0 ? (
      <ul
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
        }}
        className="z-50 max-h-60 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg"
      >
        {predictions.map((prediction, index) => (
          <li
            key={prediction.placeId}
            onMouseDown={() => selectPrediction(index)}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-100 ${
              index === highlightedIndex
                ? "bg-gold/10 text-navy"
                : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {prediction.description}
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div ref={containerRef}>
      <fieldset
        className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${error ? "border-red-400" : "focus-within:border-gold border-zinc-300"}`}
      >
        <legend className="px-1 text-xs text-zinc-400">{label}</legend>
        <div className="flex items-center gap-2">
          <svg
            className="text-gold h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (predictions.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={
              locationType === LocationType.Airport
                ? "Search for an airport..."
                : "Search for a location..."
            }
            className="text-navy w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            autoComplete="off"
          />
          <svg
            className="h-4 w-4 shrink-0 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </fieldset>
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
