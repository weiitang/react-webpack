/* eslint-disable no-console */
import { useRef, useState } from 'react';
import { Button } from 'tdesign-react';
import { FormProvider } from '@src/components/forms';
import { PageBox, PageContent, SectionBox } from '@src/components/page-box';

import {
  Form,
  FormItem,
  Input,
  InputNumber,
  InputText,
  InputRich,
} from '@src/components/forms';

import {
  TestInput,
  TestInputNumber,
  TestFromModel,
  TestTextarea,
  TestInputRich,
} from './model';

import * as Css from './index.less';

export const FormTest = () => {
  const [validators] = useState(false);

  const model = useRef(new TestFromModel());

  return (
    <PageBox>
      <PageContent>
        <SectionBox full>
          <>
            <div style={{ position: 'relative' }}>
              <div className={Css.deliveryProjectTitle}>
                <div className={Css.deliveryProject}>标题</div>
              </div>
              <Form
                onSubmit={() => {
                  const data = model.current.toData();
                  console.log('data', data);
                }}
                className={Css.deliveryModuleContainer}
              >
                <FormProvider model={model.current} validateStatus={validators}>
                  <div className={Css.deliveryFormGroup}>
                    <FormItem meta={TestInput} component={Input} />
                    <FormItem meta={TestInputNumber} component={InputNumber} />
                    <FormItem meta={TestTextarea} component={InputText} />
                    <FormItem
                      meta={TestInputRich}
                      component={InputRich}
                      props={{ showParseFile: true }}
                    />
                  </div>
                </FormProvider>

                {true ? (
                  <div className={Css.deliveryModuleButtons}>
                    <Button type="submit" theme="primary">
                      确认
                    </Button>
                    <Button theme="default">取消</Button>
                  </div>
                ) : null}
              </Form>
            </div>
          </>
        </SectionBox>
      </PageContent>
    </PageBox>
  );
};
