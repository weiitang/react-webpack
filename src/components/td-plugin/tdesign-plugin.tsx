import { isError, isString } from 'lodash';
import { DialogPlugin, MessagePlugin } from 'tdesign-react';

export function confirm(
  message:
    | string
    | {
        title: string;
        content: any;
        confirm?: string | false;
        cancel?: string | false;
      },
  onSubmit?: (instance) => void,
  onCancel?: () => void
) {
  const isObj = message && typeof message === 'object';
  const title = isObj && message.title ? message.title : '提示';
  const content = isObj ? message.content : message;

  let confirmDia = null;
  confirmDia = DialogPlugin.confirm({
    theme: 'warning',
    header: title,
    body: content,
    confirmBtn: isObj && message.confirm ? message.confirm : '确认',
    cancelBtn: isObj && message.cancel ? message.cancel : '取消',
    placement: 'center',
    onConfirm: async () => {
      await onSubmit?.(confirmDia);
      confirmDia.hide();
      confirmDia.destroy();
      confirmDia = null;
    },
    onClose: async () => {
      await onCancel?.();
      confirmDia.hide();
      confirmDia.destroy();
      confirmDia = null;
    },
    onClosed: () => {
      if (document.body.style.overflow) {
        document.body.style.overflow = null;
      }
    },
  });
}

export function alert(message, onSubmit?) {
  const isObj = message && typeof message === 'object';
  const title = isObj && message.title ? message.title : '提示';
  const content = isObj ? message.content : message;

  let confirmDia = null;
  confirmDia = DialogPlugin.alert({
    theme: 'warning',
    body: content,
    header: title,
    confirmBtn: isObj && message.confirm ? message.confirm : '确认',
    placement: 'center',
    onConfirm: async () => {
      await onSubmit?.();
      confirmDia.hide();
      confirmDia.destroy();
      confirmDia = null;
    },
    onClose: async () => {
      confirmDia.hide();
      confirmDia.destroy();
      confirmDia = null;
    },
    onClosed: () => {
      if (document.body.style.overflow) {
        document.body.style.overflow = null;
      }
    },
  });
}

export function toast(
  message,
  type: 'info' | 'success' | 'warning' | 'error' | 'question' = 'info'
) {
  let result = message;
  if (isString(message)) {
    result = message;
  } else if (isError(message)) {
    result = message?.message;
  } else if (isString(message?.msg)) {
    result = message?.msg;
  }

  MessagePlugin[type](result);
}
