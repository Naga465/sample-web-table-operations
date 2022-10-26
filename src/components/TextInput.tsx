import { FC } from "react";
import '../styles/textinput.css'

interface TextInuputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const TextInput: FC<TextInuputProps> = (props) => {
  return <input className="text-input" {...props} />;
};
export default TextInput;
