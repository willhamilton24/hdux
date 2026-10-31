import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { TextArea } from "./TextArea";

const meta: Meta<typeof TextArea> = {
  title: "HDUX/Components/TextArea",
  component: TextArea,
  decorators: [(Story) => <HduxThemeProvider config={{ defaultMode: "dark" }}><div style={{ padding: 40 }}><Story /></div></HduxThemeProvider>],
  args: { label: "Delivery instructions",  },
  argTypes: { color: { control: "color" }, cornerLength: { control: "number" }, cornerWidth: { control: "number" } },
};
export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {};
export const WithHelperText: Story = { args: { helperText: "You can change this in settings." } };
export const WithErrorText: Story = { args: { required: true, helperText: "Choose your preference.", errorText: "Please complete this field." } };
export const Disabled: Story = { args: { disabled: true } };
export const CustomCorners: Story = { args: { color: "#00e676", cornerLength: 8, cornerWidth: 3 } };
export const LightTheme: Story = { decorators: [(Story) => <HduxThemeProvider config={{ defaultMode: "light" }}><Story /></HduxThemeProvider>] };
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <TextArea {...args} value={value} onChange={(event) => setValue(event.target.value)} />;
  },
};
export const FocusOnError: Story = {
  render: (args) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [error, setError] = useState<string>();
    return <form noValidate onSubmit={(event) => {
      event.preventDefault();
      if (!ref.current?.checkValidity()) { setError("Please complete this field."); ref.current?.focus(); }
      else setError(undefined);
    }} style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
      <TextArea {...args} ref={ref} required name="preference" errorText={error} />
      <Button>Validate and focus</Button>
    </form>;
  },
};
