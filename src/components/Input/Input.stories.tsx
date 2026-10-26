import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "HDUX/Components/Input",
  component: Input,
  decorators: [
    (Story) => (
      <HduxThemeProvider
        config={{
          defaultMode: "dark",
          master: {
            mainColor: "#00d4ff",
            textColor: "#e0e0e0",
            background: "#0a0a1a",
            typography: { mainFont: '"Quantico", system-ui, sans-serif' },
            borderWidth: "2px",
            boxCorners: { length: "12px" },
          },
        }}
      >
        <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
  argTypes: {
    color: { control: "color" },
    cornerLength: { control: { type: "number", min: 4, max: 60 } },
    cornerWidth: { control: { type: "number", min: 1, max: 8 } },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "ENTER CALLSIGN",
  },
};

export const WithLabel: Story = {
  name: "With Label",
  args: {
    label: "Operator ID",
    placeholder: "ENTER ID",
  },
};

export const Controlled: Story = {
  name: "Controlled",
  render: () => {
    const [val, setVal] = useState("");
    return (
      <Input
        label="Target Coordinates"
        placeholder="00.000 N, 00.000 W"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
    );
  },
};

export const InputRow: Story = {
  name: "Input Row",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Input label="Username" placeholder="OPERATOR" />
      <Input label="Password" type="password" placeholder="••••••••" />
    </div>
  ),
};

export const CustomColors: Story = {
  name: "Custom Colors",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Input label="Alert Level" placeholder="CRITICAL" color="#ff1744" />
      <Input label="Status" placeholder="NOMINAL" color="#00e676" />
      <Input label="Warning" placeholder="ELEVATED" color="#ff6f00" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "System ID",
    value: "SYS-4472-ALPHA",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  name: "Read Only",
  args: {
    label: "Access Token",
    value: "hdx_live_k9m2p7…",
    readOnly: true,
  },
};

export const WithHelperText: Story = {
  name: "With Helper Text",
  args: {
    label: "Sector Code",
    placeholder: "ALPHA-7",
    helperText: "Use the 3-digit sector designation from your clearance badge.",
  },
};

export const WithErrorText: Story = {
  name: "With Error Text",
  args: {
    label: "Access Key",
    value: "hunter2",
    errorText: "Key does not match any active clearance on record.",
  },
};

export const RequiredEmailValidation: Story = {
  name: "Required / Email Validation",
  render: () => {
    const [email, setEmail] = useState("");
    const [touched, setTouched] = useState(false);

    const isValidEmail = (v: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const errorText =
      touched && email.length === 0
        ? "Email address is required."
        : touched && !isValidEmail(email)
        ? "Enter a valid email address."
        : undefined;

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}
        noValidate
      >
        <Input
          label="Operator Email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="operator@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          helperText={!errorText ? "We'll send mission briefings here." : undefined}
          errorText={errorText}
        />
        <button
          type="submit"
          style={{
            alignSelf: "flex-start",
            background: "transparent",
            border: "1px solid #00d4ff",
            color: "#00d4ff",
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "8px 20px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    );
  },
};

export const FocusOnError: Story = {
  name: "Focus on Error",
  render: () => {
    const callsignRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);

    const [callsign, setCallsign] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ callsign?: string; email?: string }>({});
    const [submitted, setSubmitted] = useState(false);

    const isValidEmail = (v: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const next: typeof errors = {};
      if (!callsign.trim()) next.callsign = "Callsign is required.";
      if (!email.trim()) next.email = "Email is required.";
      else if (!isValidEmail(email)) next.email = "Enter a valid email address.";

      setErrors(next);

      if (next.callsign) {
        callsignRef.current?.focus();
      } else if (next.email) {
        emailRef.current?.focus();
      } else {
        setSubmitted(true);
      }
    };

    if (submitted) {
      return (
        <p style={{ color: "#00e676", fontFamily: "inherit", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ✓ Form submitted successfully.
        </p>
      );
    }

    return (
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 340 }}
        noValidate
      >
        <p style={{ color: "#00d4ff", fontFamily: "inherit", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
          Submit with empty fields — focus jumps to the first error.
        </p>
        <Input
          ref={callsignRef}
          label="Callsign"
          name="callsign"
          required
          autoComplete="off"
          placeholder="ALPHA-7"
          value={callsign}
          onChange={(e) => {
            setCallsign(e.target.value);
            if (errors.callsign) setErrors((prev) => ({ ...prev, callsign: undefined }));
          }}
          errorText={errors.callsign}
        />
        <Input
          ref={emailRef}
          label="Operator Email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="operator@domain.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          errorText={errors.email}
        />
        <button
          type="submit"
          style={{
            alignSelf: "flex-start",
            background: "transparent",
            border: "1px solid #00d4ff",
            color: "#00d4ff",
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "8px 20px",
            cursor: "pointer",
          }}
        >
          Authenticate
        </button>
      </form>
    );
  },
};
