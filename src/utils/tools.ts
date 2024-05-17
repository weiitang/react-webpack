export function getSafeObjectProps(
  propsChain: string,
  sourceObj: object,
  defaultValue?: any
) {
  const props = propsChain.split('.');
  const target = props.reduce((obj, props) => obj?.[props], sourceObj);
  return target || defaultValue;
}

// 邮箱校验
export function isEmail(string) {
  const reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
  return reg.test(string);
}
