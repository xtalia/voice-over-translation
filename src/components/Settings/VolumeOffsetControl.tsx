import {
  createEffect,
  createSignal,
  createUniqueId,
  type JSX,
  onCleanup,
  onMount,
} from "solid-js";
import { forkT } from "../../localization/fork";
import { normalizeTranslationOffset } from "../../videoHandler/volumePreferences";
import { Slider } from "../Control/Slider";
import { SliderLabel } from "../Control/SliderLabel";
import { SliderWrapper } from "../Control/SliderWrapper";
import { Textfield } from "../Textfield/Textfield";

export type VolumeOffsetControlProps = {
  value: number;
  disabled: boolean;
  onInput: (value: number) => void;
};

const formatOffset = (value: number) =>
  value > 0 ? `+${value}` : String(value);

export function VolumeOffsetControl(
  props: VolumeOffsetControlProps,
): JSX.Element {
  const [draft, setDraft] = createSignal(formatOffset(props.value));
  const [editing, setEditing] = createSignal(false);
  const descriptionId = createUniqueId();
  let sliderRoot: HTMLElement | undefined;
  createEffect(() => {
    if (!editing()) setDraft(formatOffset(props.value));
  });
  onMount(() => {
    const input = sliderRoot?.querySelector("input");
    input?.setAttribute("aria-label", forkT("translationVolumeOffset"));
    input?.setAttribute("aria-describedby", descriptionId);
  });
  const updateFromText = (text: string) => {
    setEditing(true);
    setDraft(text);
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text.trim())) {
      const value = Number(text);
      if (Number.isFinite(value))
        props.onInput(normalizeTranslationOffset(value));
    }
  };
  const finishEditing = () => {
    setEditing(false);
    setDraft(formatOffset(props.value));
  };
  return (
    <vot-block class="vot-volume-offset">
      <SliderWrapper>
        <SliderLabel
          value={formatOffset(props.value)}
          disabled={props.disabled}
        >
          {forkT("translationVolumeOffset")}
        </SliderLabel>
        <Slider
          ref={(element) => {
            sliderRoot = element;
          }}
          min={-10}
          max={100}
          step={5}
          value={props.value}
          disabled={props.disabled}
          onInput={(value) => props.onInput(normalizeTranslationOffset(value))}
        />
      </SliderWrapper>
      <Textfield
        labelText={forkT("translationVolumeOffset")}
        value={draft()}
        disabled={props.disabled}
        inputRef={(element) => {
          element.inputMode = "decimal";
          element.setAttribute("aria-describedby", descriptionId);
          element.addEventListener("blur", finishEditing);
          onCleanup(() => element.removeEventListener("blur", finishEditing));
        }}
        onInput={updateFromText}
        onChange={finishEditing}
      />
      <vot-block id={descriptionId} class="vot-select-label__description">
        {forkT("translationVolumeOffsetDescription")}
      </vot-block>
    </vot-block>
  );
}
