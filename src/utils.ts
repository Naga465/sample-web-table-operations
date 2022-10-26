const debounce = (
  updaterFunc: Function,
  delay: number,
  delayFunc: Function
) => {
  let time: NodeJS.Timeout;
  return (...args: any) => {
    updaterFunc.apply({}, args);
    if (time){
        clearTimeout(time);
    };
    time = setTimeout(() => {
      delayFunc.apply({}, args);
    }, delay);
  };
};

export { debounce };
