/** @format */

import React from 'react';
import { Badge, Menu } from 'tdesign-react';
import css from './nav.less';

const { HeadMenu, SubMenu, MenuItem } = Menu;

export default () => {
  const switchMenu = (value) => {
    console.log('value', value);

    const a =
      'pppopuppopuppppopuppopuppopuppopuppopupopuppopuppopuppopuppopuppopuppopuppopuppopuppopu';
    console.log('value', a);
  };

  return (
    <div className={css.nav}>
      <div className={css.navLeft}>
        <HeadMenu
          theme="dark"
          expandType="popup"
          logo={
            <Badge count={2}>
              <a href="/" className={css.navLogo}>
                MA后台管理中心
              </a>
            </Badge>
          }
          onChange={(value) => switchMenu(value as string)}
          value={'null'}
        >
          <SubMenu value="workflow-service" title="流程管理">
            <MenuItem value="workflow-service">流程图配置</MenuItem>
            <MenuItem value="workflow-service/modules">模块管理</MenuItem>
            <MenuItem value="workflow-service/release-history">发布历史</MenuItem>
            <MenuItem value="workflow-service/instances">流程实例</MenuItem>
          </SubMenu>
        </HeadMenu>
      </div>
    </div>
  );
};
