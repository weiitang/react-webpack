/* eslint-disable no-console */
import {
  TestPageLayout,
  TestH2,
  TestPageStickyBar,
} from '@src/modules/hook-form/conponents';
import { Button, Space, loading } from 'tdesign-react';
import { UseFormReturn } from 'react-hook-form';

import { scrollIntoErrors } from '@src/components/hook-form';
import { HookFormTest } from './hook-form-test';
import { createFormModel } from './form.model';

export function HookFormTestLayout() {
  const formModel = createFormModel();

  formModel.onMounted((methods: UseFormReturn) => {
    methods.setValue('oc', []);
  });

  function handleSubmit() {
    formModel.trigger().then((res) => {
      if (!res) return scrollIntoErrors();

      const formJSON = formModel.toJSON();
      const formValues = formModel.getValues();
      let orgId = '';
      let timId = '';
      if (formValues.orgTimIds) {
        const id = formValues.orgTimIds.id ?? '';
        [orgId = '', timId = ''] = id.split('_');
      }
      const params = {
        ...formJSON,
        signType: Array.isArray(formJSON?.signType)
          ? formJSON?.signType
          : [formJSON?.signType],
        investeeCorporations: formJSON.investeeCorporations.map((item) => {
          // 新建的时候忽略 id
          const { ...rest } = item;
          return {
            ...rest,
            corporationName: item.corporationName?.name,
          };
        }),
        orgId,
        timId,
        introDirectoryId: formJSON.introDirectoryId?.id,
      };

      delete (params as any).orgTimIds;

      const loadInstance = loading(true);
      console.log('data', params, formJSON);
      loadInstance.hide();
    });
  }

  return (
    <TestPageLayout>
      <TestPageStickyBar
        style={{
          justifyContent: 'space-between',
          paddingTop: '14px',
          marginTop: '10px',
        }}
      >
        <TestH2>{'新建签署'}</TestH2>
        <Space size={8}>
          <Button theme="default">{'取消'}</Button>
          <Button theme="default">{'保存'}</Button>
          <Button onClick={handleSubmit}>{'确认提交'}</Button>
        </Space>
      </TestPageStickyBar>
      <HookFormTest formModel={formModel} type="create" />
    </TestPageLayout>
  );
}
