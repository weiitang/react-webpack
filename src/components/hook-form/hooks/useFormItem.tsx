import { useFormContext } from 'react-hook-form';
import { useMemo, useRef } from 'react';
import get from 'lodash/get';
import _ from 'lodash';
import { ErrorCircleFilledIcon } from 'tdesign-icons-react';

import { useHookFormContext } from '../context';
import { FormItemProps } from '../hook-form-item';

export function useFormItem(props: FormItemProps) {
  const { name, labelAlign = 'top', label, tips, status, icon, rules } = props;

  const { formState } = useFormContext() || {};
  const formModel = useHookFormContext();
  const model = useRef(get(formModel.model, name, {}));

  const renderStatus = useMemo(() => {
    if (status) return status;
    if (get(formState.errors, name)) return 'error';
    return undefined;
  }, [status, formState]);

  const renderIcon = useMemo(() => {
    if (icon === false) return null;
    if (icon === true) return <ErrorCircleFilledIcon />;
    return icon;
  }, [icon]);

  const renderTips = useMemo(() => {
    if (tips === false) return null;
    return tips || get(formState.errors, name)?.message;
  }, [tips, formState]);

  const renderRules = useMemo(() => {
    const r = _.cloneDeep(rules) || _.cloneDeep(model.current.rules);
    // required = true 时，使用 placeholder 作为 required 的提示
    if (r?.required === true && model.current.renderProps?.placeholder) {
      r.required = model.current.renderProps.placeholder;
    }
    return r;
  }, [rules]);

  const requiredMark = useMemo(
    () => Reflect.has(renderRules || {}, 'required') && renderRules.required,
    [renderRules]
  );

  const renderProps = model.current.renderProps || {};

  return {
    label,
    labelAlign,
    renderProps,
    requiredMark,
    tips: renderTips,
    icon: renderIcon,
    status: renderStatus,
    rules: renderRules,
  };
}
