import {
  UseFormReturn,
  WatchObserver,
  useForm,
  UseFormProps,
  RegisterOptions,
} from 'react-hook-form';
import { useEffect } from 'react';
import merge from 'lodash/merge';
import { EventEmitter } from './utils';

type MountedCallback = (methods: UseFormReturn) => void;
type ValuesChangeCallback = WatchObserver<Record<string, any>>;

type ModelItem = {
  defaultValue?: any;
  rules?:
    | RegisterOptions
    | {
        validate?: {
          [key: string]: (
            value?: any,
            formValues?: any,
            index?: number
          ) => void;
        };
      };
  metaProps?: {
    drop?: boolean | ((value: any) => boolean);
    map?: boolean | ((value: any) => any);
  };
  renderProps?: Record<string, any>;
  shouldRender?: (
    formValues: Record<string, any>,
    config?: { index: number }
  ) => boolean;
  fieldConfig?: Record<string, ModelItem>;
};

export type Model = Record<string, ModelItem>;

export interface FormModelType {
  originModel: Record<string, any>;
  model: Record<string, any>;
  defaultValues: Record<string, any>;
  methods: UseFormReturn;
  eventEmitter: EventEmitter;
  onMounted: (callback: MountedCallback) => void;
  watchEffect: (callback: ValuesChangeCallback, deps?: Array<string>) => void;
  useForm: (options?: UseFormProps) => UseFormReturn;

  clearErrors?: UseFormReturn['clearErrors'];
  formState?: UseFormReturn['formState'];
  getValues?: UseFormReturn['getValues'];
  handleSubmit?: UseFormReturn['handleSubmit'];
  reset?: UseFormReturn['reset'];
  setError?: UseFormReturn['setError'];
  setValue?: UseFormReturn['setValue'];
  trigger?: UseFormReturn['trigger'];
  watch?: UseFormReturn['watch'];
  unregister?: UseFormReturn['unregister'];
  register?: UseFormReturn['register'];
  control?: UseFormReturn['control'];
}

export class FormModel implements FormModelType {
  originModel: FormModelType['originModel'] = {};

  model: FormModelType['originModel'] = {};

  defaultValues: FormModelType['defaultValues'] = {};

  isMounted = false;

  methods: FormModelType['methods'];

  eventEmitter: FormModelType['eventEmitter'] = new EventEmitter();

  onMounted: FormModelType['onMounted'] = (callback: MountedCallback) => {
    this.eventEmitter.on('mounted', callback);
  };

  // 执行函数
  // 避免一些情况： onMounted 之后再绑定的函数不被执行，onMounted 之前一些 setValue 时会报错
  execute: (callback: MountedCallback) => void = (cb) => {
    if (this.isMounted) {
      cb(this.methods);
    } else {
      this.eventEmitter.on('mounted', cb);
    }
  };

  get clearErrors() {
    return this.methods?.clearErrors;
  }

  get formState() {
    return this.methods?.formState;
  }

  get getValues() {
    return this.methods?.getValues;
  }

  get handleSubmit() {
    return this.methods?.handleSubmit;
  }

  get reset() {
    return this.methods?.reset;
  }

  get setError() {
    return this.methods?.setError;
  }

  get setValue() {
    return this.methods?.setValue;
  }

  get trigger() {
    return this.methods?.trigger;
  }

  get watch() {
    return this.methods?.watch;
  }

  get unregister() {
    return this.methods?.unregister;
  }

  get register() {
    return this.methods?.register;
  }

  get control() {
    return this.methods?.control;
  }

  constructor(model: Model = {}) {
    this.originModel = model;
    this.model = model;

    this.defaultValues = Object.keys(model).reduce((acc, key) => {
      acc[key] = model[key].defaultValue;
      return acc;
    }, {});

    this.eventEmitter.on('mounted', () => {
      this.isMounted = true;
    });
  }

  useForm(options?: UseFormProps): UseFormReturn {
    if (this.methods) return this.methods;

    const mergeOptions = merge(
      {},
      { defaultValues: this.defaultValues, mode: 'all' },
      options
    );
    this.methods = useForm(mergeOptions);
    return this.methods;
  }

  watchEffect: FormModelType['watchEffect'] = (
    callback: ValuesChangeCallback,
    deps?: Array<string>
  ) => {
    useEffect(() => {
      if (!deps) {
        this.eventEmitter.on('watchEffect', callback);
      } else {
        for (const name of deps) {
          this.eventEmitter.on(`watchEffect:${name}`, callback);
        }
      }
    }, []);
  };
}
