/* eslint-disable @typescript-eslint/no-unused-vars */
import { $i18next } from '@/i18n';
export function Itest() {
  // @i18n-ignore-line
  const a = `这是${isNaN(0) ? '国际化变量1' : '国际化变量2'}`;

  return (
    <>
      <div>{$i18next.t('i18n-test:bb81f9c2:国际化')}</div>
      <div>
        {8 > 4
          ? $i18next.t('i18n-test:bb81f9c2:国际化')
          : $i18next.t('i18n-test:bb81f9c2:国际化')}
      </div>
      {/* 解析有误 换个写法 */}
      {/* <div>{`这是${isNaN(0) ? '国际化变量1' : '国际化变量2'}`}</div> */}
      <div>
        {$i18next.t('i18n-test:4f401e68:这是')}
        {isNaN(0)
          ? $i18next.t('i18n-test:65c4865e:国际化变量1')
          : $i18next.t('i18n-test:a3907dfc:国际化变量2')}
      </div>
      <div>
        {$i18next.t('i18n-test:d025e68f:这是{{_0}}{{_1}}个', { _0: 0, _1: 1 })}
      </div>
    </>
  );
}
