import classNames from 'classnames';
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayProps,
  UseFormReturn,
  UseFieldArrayReturn,
} from 'react-hook-form';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import { useMemo, useRef, useEffect, useState } from 'react';
import { useHookFormContext } from './context';
import * as styles from './index.less';
import { HookFormListItem } from './hook-form-list-item';

export interface HookFormListProps extends UseFieldArrayProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  tips?: string | boolean;
  labelAlign?: 'top' | 'left' | 'right';
  status?: 'error' | 'warning' | 'success';
  children: (
    fieldMethods: UseFieldArrayReturn & UseFormReturn
  ) => React.ReactNode;
}

function HookFormList(props: HookFormListProps) {
  const {
    children,
    className,
    style,
    tips,
    status,
    label,
    labelAlign,
    rules,
    name,
    ...otherProps
  } = props;
  const methods = useFormContext();
  const formModel = useHookFormContext();

  const [shouldRender, setShouldRender] = useState(true);

  const model = useRef(get(formModel.model, name, {}));

  const { formState } = methods;

  const renderStatus = useMemo(() => {
    if (status) return status;
    if (get(formState.errors, name)) return 'error';
    return undefined;
  }, [status, formState, name]);

  const renderTips = useMemo(() => {
    if (tips === false) return null;
    return tips || get(formState.errors, name)?.root?.message;
  }, [tips, formState, name]);

  const renderRules = useMemo(
    () => rules || model.current.rules || {},
    [rules]
  );

  const requiredMark = useMemo(
    () => Reflect.has(renderRules, 'required'),
    [renderRules]
  );

  const fieldMethods = useFieldArray({
    name,
    control: methods.control,
    rules: renderRules,
    ...otherProps,
  });

  if (isObject(model.current.fieldConfig)) {
    const listValues = methods.getValues(name);
    listValues.forEach((_, index) => {
      Object.keys(model.current.fieldConfig).forEach((key) => {
        formModel.model[`${name}.${index}.${key}`] =
          model.current.fieldConfig[key];
      });
    });
  }

  useEffect(() => {
    if (!Reflect.has(model.current, 'shouldRender')) return;

    const subscription = formModel.watch((values) => {
      const result = model.current.shouldRender(values);
      Promise.resolve(result).then(setShouldRender);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={classNames(styles.formList, className, {
        [styles.labelAlignTop]: labelAlign === 'top',
        [styles.labelAlignLeft]: labelAlign === 'left',
        [styles.labelAlignRight]: labelAlign === 'right',
      })}
      style={style}
    >
      {label && (
        <div
          className={classNames(styles.label, {
            [styles.labelRequired]: requiredMark,
          })}
        >
          {label}
        </div>
      )}
      <div className={styles.itemWrap}>
        {children({ ...methods, ...fieldMethods })}
      </div>
      {renderTips && (
        <div
          className={classNames(styles.tips, {
            [styles.tipsError]: renderStatus === 'error',
            [styles.tipsWarning]: renderStatus === 'warning',
            [styles.tipsSuccess]: renderStatus === 'success',
          })}
        >
          {renderTips as any}
        </div>
      )}
    </div>
  );
}

HookFormList.Item = HookFormListItem;

export { HookFormList };
