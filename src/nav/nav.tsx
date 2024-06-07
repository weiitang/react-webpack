/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Badge, Menu } from 'tdesign-react';
import { useNavigate } from 'react-router-dom';

import * as css from './nav.less';

const { HeadMenu, SubMenu, MenuItem } = Menu;

export default () => {
  const navigate = useNavigate();

  const [active, setActive] = useState('0');
  const [darkActive, setDarkActive] = useState('1');

  const switchMenu = (value) => {
    navigate(value);
    // console.error('value', value);
  };

  return (
    <>
      <HeadMenu
        theme="dark"
        expandType="popup"
        // logo={
        //   <Badge count={2}>
        //     <a href="/" className={css.navLogo}>
        //       TEST
        //     </a>
        //   </Badge>
        // }
        onChange={(value) => switchMenu(value as string)}
        value={'null'}
      >
        <SubMenu title="Redux">
          <MenuItem value="test">TestFn</MenuItem>
          <MenuItem value="test1">ClassFn</MenuItem>
          <MenuItem value="input">InputFn</MenuItem>
          <MenuItem value="check">CheckTd</MenuItem>
          <MenuItem value="sheet">Sheet</MenuItem>
          <MenuItem value="from">From</MenuItem>
        </SubMenu>
      </HeadMenu>
    </>
  );
};
