import classNames from "classnames";
import { useRef } from "react";
import { InputCheckboxComponent } from "./types";

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`);

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        // Call onChange with the new checked state when the checkbox is clicked
        onChange={() => onChange(!checked)}
      />
      <label
        htmlFor={inputId} // Associate the label with the input
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
    </div>
  );
};
