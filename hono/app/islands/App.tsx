import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SudokuCell from "@/components/SudokuCell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Ban, Bot, Redo, Undo, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { DeserializedField } from "pkg/number_place_wasm";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
type ModType = typeof import("pkg/number_place_wasm");

class State {
  #wasm: ModType;

  #history: Array<Uint8Array>;
  #inputHistory: Array<{
    position: number;
    value: number;
  } | null>;
  #historyIndex: number;

  get initialized() {
    return this.#historyIndex === 0;
  }

  static init(wasm: ModType): State {
    const state = new State([wasm.new_empty_field()], [], 0, wasm);
    return state;
  }

  private constructor(
    history: Array<Uint8Array>,
    inputHistory: Array<{
      position: number;
      value: number;
    } | null>,
    historyIndex: number,
    wasm: ModType,
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
    if (this.#bruteForceWorking) return false;
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
    if (this.#bruteForceWorking) return false;
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
      const inputData = { position, value: n };
      return this.#forceSwitch(nextField, inputData);
    } catch (e) {
      console.error(e);
    }
  }

  forceSwitch(nextField: Uint8Array): State {
    return this.#forceSwitch(nextField, null);
  }

  #forceSwitch(
    nextField: Uint8Array,
    inputData: { position: number; value: number } | null,
  ): State {
    const newHistory = this.#history.slice(0, this.#historyIndex + 1);
    newHistory.push(nextField);
    const newInputHistory = this.#inputHistory.slice(0, this.#historyIndex);
    newInputHistory.push(inputData);
    return new State(
      newHistory,
      newInputHistory,
      newHistory.length - 1,
      this.#wasm,
    );
  }

  cell(r: number, c: number): number | number[] {
    const position = r * 9 + c;
    const manual = this.#inputHistory
      .filter((item) => item !== null)
      .find((v, i) => i < this.#historyIndex && v.position === position)?.value;
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

  #bruteForceWorking = false;

  get bruteForceWorking() {
    return this.#bruteForceWorking;
  }

  private set bruteForceWorking(value: boolean) {
    this.#bruteForceWorking = value;
  }

  bruteForce(): {
    state: State;
    promiseState: Promise<State>;
    terminate: () => State;
  } {
    const worker = new Worker("/brute-force.js");
    const promise = new Promise<State>((resolve, reject) => {
      worker.postMessage(this.#history[this.#historyIndex]);
      worker.onmessage = (e: MessageEvent<Uint8Array>) => {
        const field = e.data;
        worker.terminate();

        const newState = this.forceSwitch(field);
        newState.bruteForceWorking = false;

        resolve(newState);
      };
      worker.onerror = (e) => {
        reject(e.message);
      };
    });

    const newState = new State(
      this.#history,
      this.#inputHistory,
      this.#historyIndex,
      this.#wasm,
    );
    newState.bruteForceWorking = true;
    const nowState = new State(
      this.#history,
      this.#inputHistory,
      this.#historyIndex,
      this.#wasm,
    );

    return {
      state: newState,
      terminate() {
        worker.terminate();
        return nowState;
      },
      promiseState: promise,
    };
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
    <div className="h-svh w-dvw flex flex-col items-center overflow-hidden">
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
              {Array.from(Array(9).keys()).map((col) => {
                const value = state?.cell(row, col) ?? [
                  1, 2, 3, 4, 5, 6, 7, 8, 9,
                ];
                const valueArr = typeof value === "number" ? [value] : value;
                return (
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
                      readOnly={state === undefined || state.bruteForceWorking}
                      noPlaceHolder={state === undefined || state.initialized}
                      onInput={(n) => {
                        if (!state) return;
                        if (!valueArr.includes(n)) {
                          toast("Impossible number", {
                            position: "top-right",
                            icon: <Ban className="size-4 text-red-600" />,
                            description: `Possible numbers are [${valueArr.toSorted()}]`,
                            duration: 1500,
                            closeButton: true,
                          });
                        } else {
                          const nextState = state.input(row, col, n);
                          if (nextState) {
                            setState(nextState);
                          }
                        }
                      }}
                      value={value}
                      className="text-2xl font-bold"
                    />
                  </div>
                );
              })}
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
          disabled={state?.isConverged() || state?.bruteForceWorking}
          onClick={() => {
            if (!state) return;
            const {
              state: nextState,
              terminate,
              promiseState,
            } = state.bruteForce();
            setState(nextState);
            (async () => {
              toast.promise(promiseState, {
                position: "top-right",
                loading: "Searching an answer...",
                duration: 1500,
                success: (data) => {
                  setState(data);
                  return "An answer found";
                },
                error: "No answer found",
                action: {
                  label: "Terminate",
                  onClick() {
                    setState(terminate());
                  },
                },
              });
            })();
          }}
        >
          <Bot />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="clear the board"
              disabled={state?.bruteForceWorking}
            >
              <X />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you absolutely sure to Reset?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete not
                only the current board, but also the history of your moves.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!state) return;
                  setState(state.reset());
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </footer>
      <Toaster />
    </div>
  );
}
