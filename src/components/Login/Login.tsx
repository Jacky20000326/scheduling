import { CSSProperties, FormEvent, useRef, useState } from "react";
import { supabase } from "../../supabase/connect";

export const Login = () => {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleEmailValidate = async () => {
    if (!emailRef.current?.checkValidity()) {
      setErrorMessage("請輸入正確的 Email 格式");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: emailRef.current?.value ?? "",
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    if (error) {
      setErrorMessage(error?.code ?? "");
    }

    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleEmailValidate();
  };

  return (
    <div style={pageStyle}>
      <div className="panel" style={panelStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>歡迎使用排班系統</h1>
          <p style={subtitleStyle}>請登入以開始管理每日排班。</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__row">
            <label htmlFor="email">電子郵件</label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
            />
            <span style={errorMessageStyle}>{errorMessage}</span>
          </div>

          <div className="form__actions">
            <button type="submit" className="form__submit">
              登入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 16px",
  background: "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #ecfeff 100%)",
};

const panelStyle: CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  gap: "24px",
};

const headerStyle: CSSProperties = {
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "26px",
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#4b5563",
  fontSize: "15px",
};

const errorMessageStyle: CSSProperties = {
  color: "red",
  fontSize: "15px",
};
