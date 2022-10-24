import { FC } from "react";

type TextInuputProps = {
    onChange?: (event:any) => void
}
const TextInput :FC<TextInuputProps>  = (props) => { 
    return (
        <input className="text-input" />
    )
} 
export default TextInput;