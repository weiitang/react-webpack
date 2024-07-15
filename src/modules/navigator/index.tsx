/* eslint-disable no-console */
import { useModuleNavigator, useRouteNavigate } from '@core';

export default function () {
  const navigators = useModuleNavigator();
  const navigate = useRouteNavigate();

  const handleClickDiv = () => {
    console.log('navigatorsClick1', navigators);
    navigate('navigator-router');
  };

  console.log('navigators', navigators);

  return (
    <div>
      <div onClick={handleClickDiv}>Router</div>
      <div className="header3">Test Navigator</div>
    </div>
  );
}
