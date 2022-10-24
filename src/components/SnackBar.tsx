import { FC, useEffect, useRef, useState } from "react";
import { SnackBarPropsType } from "../context";
import "../styles/snackbar.css";

interface SnackBarProps extends SnackBarPropsType {
  timeLapse: number;
}
const SnackBar: FC<SnackBarProps> = ({
  message,
  timeLapse = 2,
  error,
  show: _showAlert,
}) => {
  const [show, setShow] = useState<boolean>(_showAlert);
  const timer = useRef<any | null>(null);
  useEffect(() => {
    if (!!message) {
      setShow(true);
      timer.current = setTimeout(() => {
        setShow(false);
      }, timeLapse * 1000);
    }
    return () => {
      clearTimeout(timer.current);
    };
  }, [message, _showAlert]);
  return (
    <div
      style={{ display: show ? "block" : "none" }}
      className={`snack-bar ${error ? "error" : "success"}`}
    >
      <label>{message}</label>
    </div>
  );
};

export default SnackBar;
