import React, { useMemo } from 'react';
import {
  HookForm,
  HookFormItem,
  HookSelect,
  HookInput,
  HookTextarea,
  HookDatePicker,
  HookDateRangePicker,
  HookSearchInput,
  HookFormList,
} from '@src/components/hook-form';
import { type FormItemProps } from '@src/components/hook-form/hook-form-item';
import { TestFormLayout } from '@src/modules/hook-form/conponents';
import { Button } from 'tdesign-react';

export const testOption1 = [
  { name: 'RMB', id: 'cny' },
  { name: 'USD', id: 'usd' },
  { name: 'MCD', id: 'mcd' },
];

const TestFormItem = (
  props: FormItemProps & {
    children?: any;
  }
) => {
  const { name, ...restProps } = props;
  const disabled = useMemo(() => false, []);
  return (
    <HookFormItem
      name={name}
      {...restProps}
      render={(formProps) =>
        props.render({
          ...formProps,
          disabled,
        })
      }
    />
  );
};

export function HookFormTest(props) {
  const { team, formModel } = props;

  formModel.watchEffect((values, { name }) => {
    if (name === 'fileName') {
      const { fileName } = values;
      // 联动
      if (fileName === '测试') {
        formModel.setValue('Select', testOption1[0]);
        formModel.clearErrors(`Select`);
      }
    }
  });

  return (
    <TestFormLayout topStickyTranslate={80}>
      <HookForm formModel={formModel}>
        <TestFormLayout.Catalog>Test</TestFormLayout.Catalog>
        <TestFormItem
          name="Select"
          label={'Select'}
          render={(formProps) => (
            <HookSelect
              {...formProps}
              options={testOption1}
              disabled={!!team}
            />
          )}
        />

        <TestFormItem
          name="fileName"
          label={'Input'}
          render={(formProps) => <HookInput {...formProps} />}
        />

        <TestFormItem
          name="Textarea"
          label={'Textarea'}
          render={(formProps) => <HookTextarea {...formProps} />}
        />

        <TestFormItem
          name="deadline"
          label={'DatePicker'}
          render={(formProps) => (
            <HookDatePicker {...formProps} defaultValue={''} />
          )}
        />

        <TestFormItem
          name="DateRangePicker"
          label={'DateRangePicker'}
          render={(formProps) => (
            <HookDateRangePicker {...formProps} defaultValue={[]} />
          )}
        />

        <TestFormItem
          name="SearchInput"
          label={'SearchInput'}
          render={(formProps) => (
            <HookSearchInput
              {...formProps}
              search={(keyword) => {
                if (typeof keyword === 'undefined') return [];
                return [
                  {
                    id: 'A170BD3A74274F3292FE8D4EFC4C6F1A',
                    name: 'CBFT-ABA和IBAN-主体',
                  },
                  {
                    id: 'E3CD1AF9E8D44FDFBAE8E2DFBC5F5885',
                    name: '测试',
                  },
                ];
              }}
              filterable
            />
          )}
        />
        <div style={{ height: 500 }}></div>
        <TestFormLayout.Catalog>Test1</TestFormLayout.Catalog>
        <div style={{ height: 1000 }}></div>
        <TestFormLayout.Catalog>{'多行表单'}</TestFormLayout.Catalog>
        <HookFormList name="investorCorporations" label={'第一行'}>
          {({ fields, remove, append }) =>
            fields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: 8 }}>
                <HookFormList.Item
                  index={index}
                  name={`investorCorporations.${index}.corporationId`}
                  render={(formProps) => (
                    <HookSelect
                      {...formProps}
                      valueType="object"
                      filterable
                      onSearch={() => {
                        return new Promise((req) => {
                          req([
                            {
                              id: 'A170BD3A74274F3292FE8D4EFC4C6F1A',
                              name: 'CBFT-ABA和IBAN-主体',
                            },
                            {
                              id: 'E3CD1AF9E8D44FDFBAE8E2DFBC5F5885',
                              name: 'harold',
                            },
                          ]);
                        });
                      }}
                    />
                  )}
                ></HookFormList.Item>
                <HookFormList.Item
                  index={index}
                  name={`investorCorporations.${index}.businessGroup`}
                  render={(formProps) => (
                    <HookSelect {...formProps} options={testOption1} multiple />
                  )}
                ></HookFormList.Item>
                <Button
                  theme="default"
                  onClick={() =>
                    append({
                      corporationId: '',
                      businessGroup: '',
                      sealType: [],
                    })
                  }
                >
                  +
                </Button>
                <Button theme="default" onClick={() => remove(index)}>
                  -
                </Button>
              </div>
            ))
          }
        </HookFormList>
      </HookForm>
    </TestFormLayout>
  );
}
