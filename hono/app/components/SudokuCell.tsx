// const inputCss = await css`
// 	color: inherit;
// 	background-color: transparent;
// 	text-align: center;
// 	outline: none;
// 	margin: 0;
// 	height: 100%;
// 	width: 100%;
// 	font: inherit;
// 	font-size: .5em;
// `;

import { cn } from "@/lib/utils";

export default function SudokuCell(props: {
  readOnly?: boolean;
  onInput?: (value: number) => void;
  value: number | number[];
  className?: string | undefined;
  noPlaceHolder?: boolean;
}) {
  if (typeof props.value === "number" || props.value.length === 1) {
    const value =
      typeof props.value === "number" ? props.value : props.value[0];
    return (
      <div
        className={cn(
          "flex items-center justify-center size-full",
          typeof props.value !== "number" ? "text-blue-500" : undefined,
          props.className,
        )}
      >
        {value}
      </div>
    );
  }

  let placeholder: string | undefined = undefined;
  if (!(props.noPlaceHolder || props.value.length === 0)) {
    placeholder = `[${props.value.length}]`;
  }
  return (
    <input
      onInput={(ev) => {
        const input = ev.target as HTMLInputElement;
        const inputstr = input.value;
        input.value = "";
        if (inputstr.match(/^[1-9]$/g)) {
          const value = Number.parseInt(inputstr);
          if (props.onInput) {
            props.onInput(value);
          }
        }
      }}
      inputMode="numeric"
      readOnly={props.readOnly}
      placeholder={placeholder}
      className={cn(
        "text-inherit bg-transparent text-center outline-none m-0 size-full",
        props.className,
      )}
    />
  );
}
