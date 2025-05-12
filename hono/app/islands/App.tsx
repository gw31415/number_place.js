import SudokuCell from "@/components/SudokuCell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Redo, Undo, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { DeserializedField } from "pkg/number_place_wasm";
type modtype = typeof import("pkg/number_place_wasm");

class State {
  #wasm: modtype;

  #history: Array<Uint8Array>;
  #inputHistory: Array<{
    position: number;
    value: number;
  }>;
  #historyIndex: number;

  get initialized() {
    return this.#historyIndex === 0;
  }

  static init(wasm: modtype): State {
    const state = new State([wasm.new_empty_field()], [], 0, wasm);
    return state;
  }

  private constructor(
    history: Array<Uint8Array>,
    inputHistory: Array<{
      position: number;
      value: number;
    }>,
    historyIndex: number,
    wasm: modtype,
  ) {
    this.#history = history;
    this.#inputHistory = inputHistory;
    this.#historyIndex = historyIndex;
    this.#wasm = wasm;
  }

  public get field(): DeserializedField {
    return this.#wasm.deserialize_field(this.#history[this.#historyIndex]);
  }

  public get undoable(): boolean {
    return this.#historyIndex > 0;
  }

  undo(): State | undefined {
    if (this.undoable) {
      return new State(
        this.#history,
        this.#inputHistory,
        this.#historyIndex - 1,
        this.#wasm,
      );
    }
  }

  public get redoable(): boolean {
    return this.#historyIndex < this.#history.length - 1;
  }

  redo(): State | undefined {
    if (this.redoable) {
      return new State(
        this.#history,
        this.#inputHistory,
        this.#historyIndex + 1,
        this.#wasm,
      );
    }
  }

  input(r: number, c: number, n: number): State | undefined {
    const position = r * 9 + c;
    try {
      const nextField = this.#wasm.next_field(
        this.#history[this.#historyIndex],
        position,
        n,
      );
      const newHistory = this.#history.slice(0, this.#historyIndex + 1);
      newHistory.push(nextField);
      const newInputHistory = this.#inputHistory.slice(0, this.#historyIndex);
      newInputHistory.push({ position, value: n });
      return new State(
        newHistory,
        newInputHistory,
        newHistory.length - 1,
        this.#wasm,
      );
    } catch (e) {
      console.error(e);
    }
  }

  cell(r: number, c: number): number | number[] {
    const position = r * 9 + c;
    const manual = this.#inputHistory.find(
      (v, i) => i < this.#historyIndex && v.position === position,
    )?.value;
    if (manual) {
      return manual;
    }
    const value = this.field[position];
    return Array.from(this.#wasm.deserialize_entropy(value));
  }

  isConverged(): boolean {
    for (const entropy of this.field) {
      if (entropy.length !== 1) {
        return false;
      }
    }
    return true;
  }

  bruteForce(): State | undefined {
    try {
      const nextField = this.#wasm.brute_force(
        this.#history[this.#historyIndex],
      );
      if (nextField) {
        const newHistory = this.#history.slice(0, this.#historyIndex + 1);
        newHistory.push(nextField);
        return new State(
          newHistory,
          this.#inputHistory,
          newHistory.length - 1,
          this.#wasm,
        );
      }
    } catch (_) {}
  }

  reset(): State {
    return State.init(this.#wasm);
  }
}

export default function () {
  const [state, setState] = useState<State | undefined>();
  useEffect(() => {
    import("pkg/number_place_wasm").then(async (mod) => {
      await mod.default();
      setState(State.init(mod));
    });
  }, []);
  return (
    // <link href="https://fonts.googleapis.com/css2?family=Fascinate&display=swap&text=Solve+Sudoku" rel="stylesheet"/>
    // <header className="h-1/5 flex flex-col items-center justify-around p-6 fill-current">
    //   <h1 className="font-[Fascinate] text-4xl">Solve Sudoku</h1>
    // </header>
    <div className="h-dvh w-dvw flex flex-col items-center">
      <header className="h-1/5 flex flex-col items-center justify-around p-6 fill-current">
        <img
          src="/solve_sudoku.svg"
          aria-label="Solve Sudoku"
          className="object-contain size-full max-w-md"
        />
      </header>
      <main className="grow size-[90dvmin] sm:size-[70dvmin] flex flex-col justify-center text-center px-4 py-8">
        <div className="aspect-square grid grid-rows-9 border border-black">
          {Array.from(Array(9).keys()).map((row) => (
            <div key={`r${row}`} className="grid grid-cols-9 overflow-hidden">
              {Array.from(Array(9).keys()).map((col) => (
                <div
                  key={`r${row}-c${col}`}
                  className={cn("border size-full", [
                    ...(row % 3 === 0 ? ["border-t-black"] : []),
                    ...(row % 3 === 2 ? ["border-b-black"] : []),
                    ...(col % 3 === 0 ? ["border-l-black"] : []),
                    ...(col % 3 === 2 ? ["border-r-black"] : []),
                  ])}
                >
                  <SudokuCell
                    noPlaceHolder={state === undefined || state.initialized}
                    onInput={(n) => {
                      if (!state) return;
                      const nextState = state.input(row, col, n);
                      if (nextState) {
                        setState(nextState);
                      }
                    }}
                    value={state?.cell(row, col) ?? [1, 2, 3, 4, 5, 6, 7, 8, 9]}
                    className="text-2xl font-bold"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
      <footer className="h-1/10 w-dvw p-2 flex justify-evenly items-center sticky">
        <Button
          variant="ghost"
          size="icon"
          aria-label="undo"
          disabled={!state?.undoable}
          onClick={() => {
            if (!state) return;
            setState(state.undo());
          }}
        >
          <Undo />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="redo"
          disabled={!state?.redoable}
          onClick={() => {
            if (!state) return;
            setState(state.redo());
          }}
        >
          <Redo />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="find one of the answers by the program"
          disabled={state?.isConverged()}
          onClick={() => {
            if (!state) return;
            const nextState = state.bruteForce();
            if (nextState) {
              setState(nextState);
            }
          }}
        >
          <Bot />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="clear the board"
          onClick={() => {
            if (!state) return;
            setState(state.reset());
          }}
        >
          <X />
        </Button>
      </footer>
    </div>
  );
}
