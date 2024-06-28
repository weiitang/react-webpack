declare module '*.jpg';
declare module '*.pdf';
declare module '*.png';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.xlsx';
declare module '*.json' {
  const jsonValue: any;
  export default jsonValue;
}
